type Env = {
  APP_VERSION?: string;
  GEMINI_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SSLCOMMERZ_STORE_ID?: string;
  SSLCOMMERZ_STORE_PASSWORD?: string;
};

type PagesContext = {
  env: Env;
};

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
  const checks = {
    gemini: Boolean(env.GEMINI_API_KEY),
    supabase: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    sslcommerz: Boolean(
      env.SSLCOMMERZ_STORE_ID && env.SSLCOMMERZ_STORE_PASSWORD,
    ),
  };

  return Response.json(
    {
      ok: true,
      service: "jel-study-abroad-api",
      version: env.APP_VERSION ?? "unknown",
      configured: Object.values(checks).every(Boolean),
      checks,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
};
