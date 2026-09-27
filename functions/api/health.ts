type Env = {
  APP_VERSION?: string;
  GEMINI_API_KEY?: string;
  GEMINI_TTS_API_KEY?: string;
  SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SSLCOMMERZ_STORE_ID?: string;
  SSLCOMMERZ_STORE_PASSWORD?: string;
};

type PagesContext = {
  env: Env;
};

const DEFAULT_SUPABASE_URL = "https://fkwujxzeahauouhquhdw.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_QaOyxgqQVKNN39QIxcv7hw_QHP7PKK5";

const hasValue = (value?: string) => Boolean(value?.trim());

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
  const supabaseUrl =
    env.SUPABASE_URL?.trim() ||
    env.VITE_SUPABASE_URL?.trim() ||
    DEFAULT_SUPABASE_URL;

  const supabasePublicKey =
    env.SUPABASE_KEY?.trim() ||
    env.VITE_SUPABASE_ANON_KEY?.trim() ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  const checks = {
    gemini: hasValue(env.GEMINI_API_KEY) || hasValue(env.GEMINI_TTS_API_KEY),
    supabase: Boolean(supabaseUrl && supabasePublicKey),
    sslcommerz: hasValue(env.SSLCOMMERZ_STORE_ID) && hasValue(env.SSLCOMMERZ_STORE_PASSWORD),
  };

  // "configured" represents the core Study Abroad runtime, not optional integrations.
  // Public lead capture intentionally uses the publishable Supabase path protected by
  // RLS / submit_public_lead; an elevated Supabase secret is not required for core health.
  const configured = checks.gemini && checks.supabase;

  const optional = {
    supabaseElevated:
      hasValue(env.SUPABASE_SECRET_KEY) || hasValue(env.SUPABASE_SERVICE_ROLE_KEY),
    sslcommerz: checks.sslcommerz,
  };

  return Response.json(
    {
      ok: true,
      service: "jel-study-abroad-api",
      version: env.APP_VERSION ?? "unknown",
      configured,
      checks,
      optional,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
};
