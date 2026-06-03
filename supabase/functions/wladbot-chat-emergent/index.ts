// wladbot-chat-emergent v2 — RAG threshold 0.55 → 0.25 (Iter 92.6 fix applied to EF)
// Voyage-3 cosine similarities for in-domain Wlad-corpus queries cluster
// between 0.25 and 0.45 (empirically measured against 609 chunks).
// 0.55 was filtering EVERYTHING out → generic answers without grounding.
// Python backend was already on 0.25 since Iter 92.6 but the Edge Function
// was missed. Aligning both paths now.
//
// Auth via shared secret (X-Sync-Secret) + mongo_user_id payload.
// Internally bridges to Supabase user and runs RAG → Claude.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SYNC_SECRET = Deno.env.get('EMERGENT_SYNC_SECRET') ?? '';
const VOYAGE_API_KEY = Deno.env.get('VOYAGE_API_KEY') ?? '';
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';

// RAG tuning
const MATCH_THRESHOLD = 0.25;
const MATCH_COUNT = 6;
const NEIGHBOR_RADIUS = 1;

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-sync-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

type Msg = { role: 'user' | 'assistant'; content: string };

async function embed(text: string): Promise<number[]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'voyage-3',
      input: [text],
      input_type: 'query',
      output_dimension: 1024,
    }),
  });
  if (!res.ok) throw new Error(`voyage ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.data[0].embedding;
}

async function claude(args: { model: string; system: string; messages: Msg[]; maxTokens?: number; temperature?: number }): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: args.model,
      system: args.system,
      messages: args.messages,
      max_tokens: args.maxTokens ?? 1024,
      temperature: args.temperature ?? 0.7,
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method === 'GET') {
    return json({
      ok: true,
      service: 'wladbot-chat-emergent',
      version: 2,
      match_threshold: MATCH_THRESHOLD,
      match_count: MATCH_COUNT,
      secret_configured: !!SYNC_SECRET,
      voyage_configured: !!VOYAGE_API_KEY,
      anthropic_configured: !!ANTHROPIC_API_KEY,
    });
  }
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const provided = req.headers.get('X-Sync-Secret') ?? '';
  if (!SYNC_SECRET || !timingSafeEqual(provided, SYNC_SECRET)) {
    return json({ error: 'unauthorized' }, 401);
  }

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400); }

  const { mongo_user_id, message, history, document_set } = body ?? {};
  if (!mongo_user_id || !message) {
    return json({ error: 'missing_fields', required: ['mongo_user_id', 'message'] }, 400);
  }

  const { data: user } = await sb
    .from('users')
    .select('id, full_name')
    .eq('mongo_user_id', mongo_user_id)
    .maybeSingle();

  if (!user) {
    return json({ error: 'unknown_user', detail: 'mongo_user_id not bridged. Call /user-mirror first.' }, 404);
  }

  const started = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { data: clsPrompt } = await sb
      .from('prompt_templates')
      .select('system_prompt, model_hint')
      .eq('name', 'wladbot_classifier').eq('is_active', true)
      .order('version', { ascending: false }).limit(1).maybeSingle();

    let intent: 'theory' | 'speech' = 'theory';
    if (clsPrompt) {
      const cls = await claude({
        model: clsPrompt.model_hint ?? 'claude-haiku-4-5-20251001',
        system: clsPrompt.system_prompt,
        messages: [{ role: 'user', content: message }],
        maxTokens: 16, temperature: 0,
      });
      intent = cls.toLowerCase().includes('speech') ? 'speech' : 'theory';
    }

    const queryVec = await embed(message);
    const { data: matches } = await sb.rpc('match_wladbot_with_neighbors', {
      query_embedding: queryVec as unknown as string,
      match_count: MATCH_COUNT,
      neighbor_radius: NEIGHBOR_RADIUS,
      match_threshold: MATCH_THRESHOLD,
      filter_source: document_set ?? null,
    });

    const context = (matches ?? [])
      .map((m: any, i: number) => `[${i + 1}] (${m.source})\n${m.content}`)
      .join('\n\n---\n\n');

    const promptName = intent === 'speech' ? 'wladbot_speech' : 'wladbot_theory';
    const { data: answerPrompt } = await sb
      .from('prompt_templates')
      .select('system_prompt, model_hint')
      .eq('name', promptName).eq('is_active', true)
      .order('version', { ascending: false }).limit(1).maybeSingle();

    if (!answerPrompt) throw new Error(`no active prompt template for ${promptName}`);

    const systemWithCtx = context
      ? `${answerPrompt.system_prompt}\n\n# Retrieved context\n${context}`
      : answerPrompt.system_prompt;

    const messages: Msg[] = [
      ...((history ?? []) as Msg[]).slice(-6),
      { role: 'user', content: message },
    ];

    const answer = await claude({
      model: answerPrompt.model_hint ?? 'claude-opus-4-7',
      system: systemWithCtx,
      messages,
      maxTokens: 1024,
    });

    // Log RAG telemetry so we can see match counts going forward
    try {
      await sb.rpc('log_system_event', {
        p_component: 'wladbot-chat-emergent',
        p_event: 'answered',
        p_level: 'info',
        p_user_id: user.id,
        p_request_id: requestId,
        p_duration_ms: Date.now() - started,
        p_payload: {
          intent,
          match_count: matches?.length ?? 0,
          top_similarity: matches?.[0]?.similarity ?? null,
          threshold: MATCH_THRESHOLD,
        },
        p_error_class: null,
        p_error_message: null,
      });
    } catch (_) { /* never block answer */ }

    return json({
      ok: true,
      intent,
      answer,
      sources: (matches ?? []).map((m: any) => ({
        source: m.source, chunk_id: m.chunk_id, similarity: m.similarity,
      })),
      meta: {
        request_id: requestId,
        duration_ms: Date.now() - started,
        mongo_user_id,
        supabase_user_id: user.id,
        match_count: matches?.length ?? 0,
        threshold: MATCH_THRESHOLD,
      },
    });
  } catch (e: any) {
    console.error('wladbot-chat-emergent failure', e);
    return json({
      error: 'internal',
      detail: String(e?.message ?? e).slice(0, 500),
      meta: { request_id: requestId, duration_ms: Date.now() - started },
    }, 500);
  }
});
