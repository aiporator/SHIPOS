// stripe-admin v1 — server-side Stripe admin actions
//
// Actions:
//   create_coupon          { percent_off, duration, name, max_redemptions }
//   create_promotion_code  { coupon_id, code, max_redemptions }
//   create_payment_link    { price_id }
//
// Auth: relies on private edge function (no JWT, not exposed via /api).
// Call from Supabase SQL via pg_net or from authenticated backend.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^17";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "stripe_not_configured" }), { status: 503 });
  }

  let payload: any;
  try { payload = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 }); }

  const action = payload.action;

  try {
    if (action === "create_coupon") {
      const coupon = await stripe.coupons.create({
        percent_off: payload.percent_off ?? 100,
        duration: payload.duration ?? "once",
        name: payload.name ?? "Test Coupon",
        max_redemptions: payload.max_redemptions ?? 3,
      });
      return new Response(JSON.stringify({ ok: true, coupon }), { status: 200 });
    }

    if (action === "create_promotion_code") {
      const promo = await stripe.promotionCodes.create({
        coupon: payload.coupon_id,
        code: payload.code ?? "FOUNDER_TEST",
        max_redemptions: payload.max_redemptions ?? 3,
      });
      return new Response(JSON.stringify({ ok: true, promotion_code: promo }), { status: 200 });
    }

    if (action === "create_payment_link") {
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: payload.price_id, quantity: 1 }],
        allow_promotion_codes: true,
      });
      return new Response(JSON.stringify({ ok: true, payment_link: link }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "unknown_action", action }), { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: "stripe_error", detail: msg }), { status: 500 });
  }
});
