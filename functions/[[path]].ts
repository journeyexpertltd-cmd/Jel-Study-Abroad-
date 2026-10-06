interface Env {}

const SPA_ROUTES = new Set([
  "/", "/about", "/services", "/destinations", "/partners", "/scholarships",
  "/blogs", "/contact", "/booking", "/student-portal", "/finder", "/checker",
  "/study-abroad/apply", "/admin", "/franchise", "/partnersync",
  "/scholarshipmatcher", "/admissionpredictor", "/globalmarketplace",
  "/ects-calculator"
]);

const STATIC_PREFIXES = ["/assets/", "/privacy/", "/terms/", "/refund/", "/cookies/"];
const STATIC_FILES = new Set(["/robots.txt", "/sitemap.xml", "/site.webmanifest", "/favicon.ico"]);

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (
    STATIC_FILES.has(pathname) ||
    STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
    /\.[a-z0-9]{2,8}$/i.test(pathname)
  ) {
    return context.next();
  }

  if (SPA_ROUTES.has(pathname)) {
    const rewritten = new URL(context.request.url);
    rewritten.pathname = "/";
    return context.next(new Request(rewritten.toString(), context.request));
  }

  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Page Not Found | JEL Study Abroad</title></head><body style="font-family:system-ui;padding:48px;max-width:720px;margin:auto"><h1>Page not found</h1><p>The requested JEL Study Abroad page does not exist.</p><p><a href="/">Return to JEL Study Abroad</a></p></body></html>`,
    { status: 404, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } }
  );
};
