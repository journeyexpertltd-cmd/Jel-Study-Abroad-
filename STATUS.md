# JEL Study Abroad — STATUS

Last updated: 2026-10-06
Phase: 2 trust/indexing/security pass substantially complete

## DONE
- Production domain confirmed: https://journeyexpertbd.com.
- Cloudflare Free Website + Pages production branch main confirmed.
- Angela voice/chat production implementation retained with Bangla/English handling.
- Meta Pixel ID 1294635368719190 configured in production and preview.
- Meta PageView / WhatsApp Contact / social outbound tracking hooks implemented.
- Meta tracking now requires explicit analytics consent.
- Cookie consent banner added with Accept/Decline choices and Cookie Policy link.
- Gemini API key migrated from plain_text to Cloudflare secret_text in production and preview.
- Owner-confirmed Trade / Travel Agency / Civil Aviation Licence No. 102 published.
- Unverified hard-coded licence/registration identifiers removed from the public About page.
- Owner-confirmed office address retained.
- Privacy, Terms, Refund/Cancellation and Cookie Policy pages created.
- Legal links added to footer.
- Sitemap updated with current lastmod and legal pages; stale changefreq removed.
- Homepage SEO metadata refocused on JEL Study Abroad; obsolete meta keywords removed in source.
- Organization sameAs aligned to Facebook/Instagram website links.
- HSTS, nosniff, frame protection, referrer policy, microphone self-only Permissions-Policy and CSP Report-Only updated.
- Unsupported public claims about visa conversions, certified partner counts, alumni hosts, tuition coverage and scholarship certainty sanitized.
- Real HTTP 404 middleware built successfully on preview branch fix/http-404-routing-20261006; known /about route rendered successfully in Cloudflare Browser Rendering.

## NEXT
- Complete second 404 proof (random URL returns true 404) before merging preview middleware.
- Replace/verify dedicated 1200x630 OG artwork.
- Continue deep content audit for unverified university/scholarship/current-rule claims.
- Run browser/device QA for Angela, forms, tools and responsive layout.
- Verify Meta Events Manager receives consented PageView and Contact events.
- Search Console/Bing/indexing checks.
- Security/dependency/secret-history audit and CI hardening.

## OWNER MUST DO
- Have Privacy/Terms/Refund/Cookie wording reviewed by qualified Bangladeshi legal counsel.
- Keep institution/scholarship/visa facts verified from current official sources.
- Meta/Instagram account-level permissions remain owner-controlled.

## RISKS / BLOCKERS
- Full browser/device matrix not yet proven.
- 404 middleware remains preview-only until random-route HTTP proof is complete.
- Some study-abroad data/content may require current official-source verification.
