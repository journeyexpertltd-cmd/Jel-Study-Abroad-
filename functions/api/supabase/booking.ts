import { createClient } from '@supabase/supabase-js';

type Context = { request: Request; env: Record<string, string | undefined> };

type LeadPayload = {
  name?: unknown;
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  mobileNumber?: unknown;
  preferredCountry?: unknown;
  preferred_country?: unknown;
  educationLevel?: unknown;
  education_level?: unknown;
  message?: unknown;
  source?: unknown;
};

const PROJECT_URL = 'https://fkwujxzeahauouhquhdw.supabase.co';
const PUBLIC_KEY = 'sb_publishable_QaOyxgqQVKNN39QIxcv7hw_QHP7PKK5';
const ALLOWED_SOURCES = new Set(['website', 'website_exit', 'consultation', 'student_portal', 'angela']);

const json = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
  },
});

const clean = (value: unknown, max: number) => typeof value === 'string'
  ? value.replace(/\s+/g, ' ').trim().slice(0, max)
  : '';

const validEmail = (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function onRequest({ request, env }: Context): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }

  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return json({ success: false, error: 'origin_not_allowed' }, 403);
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return json({ success: false, error: 'json_required' }, 415);
  }

  const declaredLength = Number(request.headers.get('content-length') || '0');
  if (declaredLength > 16_384) return json({ success: false, error: 'payload_too_large' }, 413);

  let payload: LeadPayload;
  try {
    payload = await request.json() as LeadPayload;
  } catch {
    return json({ success: false, error: 'invalid_json' }, 400);
  }

  const name = clean(payload.name ?? payload.fullName, 120);
  const email = clean(payload.email, 180).toLowerCase();
  const phone = clean(payload.phone ?? payload.mobileNumber, 40);
  const preferredCountry = clean(payload.preferredCountry ?? payload.preferred_country, 100);
  const educationLevel = clean(payload.educationLevel ?? payload.education_level, 100);
  const message = clean(payload.message, 1200);
  const requestedSource = clean(payload.source, 40).toLowerCase();
  const source = ALLOWED_SOURCES.has(requestedSource) ? requestedSource : 'website';

  if (!name || !phone) return json({ success: false, error: 'name_and_phone_required' }, 400);
  if (!validEmail(email)) return json({ success: false, error: 'invalid_email' }, 400);

  const supabaseUrl = env.SUPABASE_URL?.trim() || env.VITE_SUPABASE_URL?.trim() || PROJECT_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    || env.SUPABASE_KEY?.trim()
    || env.VITE_SUPABASE_ANON_KEY?.trim()
    || PUBLIC_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // Preferred production path: controlled SECURITY DEFINER RPC from the versioned migration.
    const rpc = await supabase.rpc('submit_public_lead', {
      p_name: name,
      p_email: email || null,
      p_phone: phone,
      p_preferred_country: preferredCountry || null,
      p_education_level: educationLevel || null,
      p_message: message || null,
      p_source: source,
    });

    if (!rpc.error) return json({ success: true, id: rpc.data ?? null }, 201);

    // Compatibility path for the already-live leads table while the migration is being applied.
    if (String(rpc.error.code || '') === 'PGRST202' || String(rpc.error.message || '').includes('submit_public_lead')) {
      const inserted = await supabase
        .from('leads')
        .insert({
          name,
          email: email || null,
          phone,
          source,
          status: 'New',
          preferred_country: preferredCountry || null,
          education_level: educationLevel || null,
          message: message || null,
        })
        .select('id')
        .single();
      if (!inserted.error) return json({ success: true, id: inserted.data?.id ?? null }, 201);
    }

    console.warn('Lead persistence rejected by database policy', rpc.error.code || 'unknown');
    return json({ success: false, error: 'lead_persistence_unavailable' }, 503);
  } catch (error) {
    console.warn('Lead persistence exception', error instanceof Error ? error.message : 'unknown');
    return json({ success: false, error: 'lead_persistence_unavailable' }, 503);
  }
}
