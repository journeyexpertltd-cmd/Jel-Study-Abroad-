# GitHub-first source-of-truth policy

## Production authority

The dedicated repository `journeyexpertltd-cmd/Jel-Study-Abroad-` on the `main` branch is the production source of truth for `https://journeyexpertbd.com`. Cloudflare Pages must remain connected to this exact repository and branch. The AI Studio app is treated as an app workspace and export/reference source, not as a second production deployment target.

## Safe change flow

All code changes should be made in a feature branch, reviewed locally, and merged to `main` only after `npm run lint`, `npm run check:seo`, and `npm run build` pass. Cloudflare Pages should deploy only from the approved `main` commit. If a preview or production smoke test fails, stop the rollout and keep the last successful deployment active.

## Scope separation

This repository and deployment are exclusively for Study Abroad at `journeyexpertbd.com`. Do not add corporate-domain URLs, corporate assets, corporate API endpoints, or corporate credentials. Changes to AI Studio must be exported into this repository before they can become production changes.

## Backend safety

Gemini, Supabase, and SSLCommerz credentials remain Cloudflare encrypted secrets. They must not be stored in Git, Vite-exposed variables, workflow logs, or chat. Backend changes must be tested in Preview first and must not issue payment, database-write, or external AI requests during a public-site health check.

## Monitoring

The repository contains daily read-only workflows for CI, live SEO/Uptime, Live Monitor, and Repository Health. These checks verify the repository identity, `main` branch, canonical routes, sitemap, robots.txt, security headers, API health, and corporate-domain isolation. They do not modify production or index URLs automatically.

## AI Studio relationship

AI Studio remains useful for app editing and export, but it is not assumed to synchronize bidirectionally with GitHub. After any AI Studio change, export or copy the intended code into a feature branch, run the full checks, review the diff, and merge only the verified result.
