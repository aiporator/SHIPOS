// Public Stripe webhook receiver. Verifies signature, dedupes via idempotency_keys,
// and projects subscription state into public.subscriptions + public.users.

import { jsonResponse, errorResponse, corsHeaders } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { logEvent } from "../_shared/log.ts";
import Stripe from "npm:stripe@16.12.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-09-30.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

interface SubscriptionRow {
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  current_period_start: string;
  current_period_end: string;
  trial_ends_at: string | null;
  canceled_at: string | null;
  amount_paid_eur_cents: number;
  payment_method: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  metadata: Record<string, unknown>;
}

async function ensureUserByCustomer(
  sb: ReturnType<typeof serviceClient>,
  customerId: string,
): Promise<string> {
  const existing = await sb
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data.id as string;

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) throw new Error(`stripe customer ${customerId} is deleted`);
  const email = customer.email;
  if (!email) throw new Error(`stripe customer ${customerId} has no email`);

  const byEmail = await sb
    .from("users")
    .select("id")
    .eq("email_lower", email.toLowerCase())
    .maybeSingle();
  if (byEmail.error) throw byEmail.error;
  if (byEmail.data) {
    const link = await sb
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", byEmail.data.id);
    if (link.error) throw link.error;
    return byEmail.data.id as string;
  }

  const created = await sb
    .from("users")
    .insert({
      email,
      full_name: customer.name ?? null,
      source_platform: "leader-os",
      stripe_customer_id: customerId,
      meta_tags: ["leader-os"],
    })
    .select("id")
    .single();
  if (created.error) throw created.error;
  return created.data.id as string;
}

async function planForPriceId(
  sb: ReturnType<typeof serviceClient>,
  priceId: string,
): Promise<string> {
  const { data, error } = await sb
    .from("pricing_plans")
    .select("id")
    .eq("stripe_price_id", priceId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`no pricing_plan mapped to stripe_price_id ${priceId}`);
  return data.id as string;
}

function toIso(unixSec: number | null | undefined): string | null {
  if (!unixSec) return null;
  return new Date(unixSec * 1000).toISOString();
}

async function projectSubscription(
  sb: ReturnType<typeof serviceClient>,
  sub: Stripe.Subscription,
): Promise<void> {
  const userId = await ensureUserByCustomer(sb, sub.customer as string);
  const item = sub.items.data[0];
  if (!item) throw new Error(`subscription ${sub.id} has no items`);
  const planId = await planForPriceId(sb, item.price.id);

  const row: SubscriptionRow = {
    user_id: userId,
    plan_id: planId,
    status: sub.status,
    started_at: toIso(sub.start_date)!,
    current_period_start: toIso(sub.current_period_start)!,
    current_period_end: toIso(sub.current_period_end)!,
    trial_ends_at: toIso(sub.trial_end),
    canceled_at: toIso(sub.canceled_at),
    amount_paid_eur_cents: item.price.unit_amount ?? 0,
    payment_method: "stripe_card",
    stripe_subscription_id: sub.id,
    stripe_customer_id: sub.customer as string,
    metadata: sub.metadata as Record<string, unknown>,
  };

  const { error } = await sb
    .from("subscriptions")
    .upsert(row, { onConflict: "stripe_subscription_id" });
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return errorResponse(405, "method_not_allowed", "POST only");

  const requestId = crypto.randomUUID();
  const started = Date.now();
  const sb = serviceClient();

  const sig = req.headers.get("stripe-signature");
  if (!sig) return errorResponse(400, "missing_signature", "stripe-signature header required");

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      STRIPE_WEBHOOK_SECRET,
      undefined,
      cryptoProvider,
    );
  } catch (e) {
    return errorResponse(400, "invalid_signature", (e as Error).message);
  }

  // Dedupe via idempotency_keys keyed on the Stripe event ID.
  const { data: claim, error: claimErr } = await sb.rpc("claim_idempotency_key", {
    p_key: `stripe:${event.id}`,
    p_source: "stripe",
    p_operation: event.type,
    p_user_id: null,
    p_payload: { livemode: event.livemode },
  });
  if (claimErr) {
    return errorResponse(500, "idempotency_failed", claimErr.message);
  }
  const decision = (claim as Array<{ decision: string; cached_response: unknown }>)?.[0];
  if (decision?.decision === "duplicate") {
    return jsonResponse({ ok: true, deduped: true, eventId: event.id });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await projectSubscription(sb, event.data.object as Stripe.Subscription);
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await projectSubscription(sb, sub);
        }
        break;
      }
      default:
        // Ignored event types still claim the idempotency key, returning 200.
        break;
    }

    await logEvent(sb, {
      component: "stripe-webhook",
      event: "processed",
      requestId,
      durationMs: Date.now() - started,
      payload: { eventType: event.type, eventId: event.id, livemode: event.livemode },
    });

    return jsonResponse({ ok: true, eventId: event.id, type: event.type });
  } catch (e) {
    const err = e as Error;
    await logEvent(sb, {
      component: "stripe-webhook",
      event: "processing_failed",
      level: "error",
      requestId,
      durationMs: Date.now() - started,
      errorClass: err.name,
      errorMessage: err.message,
      payload: { eventType: event.type, eventId: event.id },
    });
    // Return 500 so Stripe retries — only if the failure is transient. If you
    // want to swallow processing errors instead, change this to a 200.
    return errorResponse(500, "processing_failed", err.message);
  }
});
