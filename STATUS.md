# JEL Study Abroad — STATUS

Last updated: 2026-10-06
Phase: 1 Discovery complete; Phase 2 next

## DONE
- Confirmed production site: https://journeyexpertbd.com
- Confirmed Cloudflare Free Website zone active.
- Confirmed Cloudflare Pages project: jel-study-abroad.
- Confirmed production branch: main.
- Confirmed production deployment success for Meta Business tracking hooks.
- Confirmed Angela voice/chat implementation exists in production code with Bangla/English handling and stop/cancel logic.
- Confirmed Facebook, Instagram, YouTube, LinkedIn and prefilled Business WhatsApp links exist in App.tsx.
- Confirmed Organization JSON-LD sameAs uses social links.
- Confirmed SPA metadata and canonical updates exist.
- Confirmed no dedicated Privacy, Terms, Refund/Cancellation or Cookie routes found in repository search.

## NEXT
Phase 2:
1. Create Privacy, Terms, Refund/Cancellation, Cookie notice, About and Contact routes as needed.
2. Implement real HTTP 404 handling for unknown routes.
3. Clean sitemap and trailing-slash canonical consistency.
4. Remove meta keywords if present.
5. Tighten titles/descriptions and add raster 1200x630 OG image.
6. Add/verify hreflang and crawlable static content.
7. Verify forms/tools and legal disclaimers.

## BLOCKERS / UNVERIFIED
- JavaScript-on browser visual QA not available in this chat tool session.
- Search Console state not re-verified in this phase.
- Meta Pixel ID is not configured; tracking hooks are inert until owner supplies/configures the correct Pixel ID.
- Facebook/Instagram account-level automation requires owner Meta login/permissions.
- Legal wording requires owner/legal review.

## OWNER TASKS
- Provide/verify legal entity fields and licence/accreditation numbers, or keep placeholders.
- Connect Facebook Page + Instagram Business account to Meta Business Suite/Metricool.
- Provide Meta Pixel ID when ready.
