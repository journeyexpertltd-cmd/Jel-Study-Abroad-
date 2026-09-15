# JEL Study Abroad — SEO, Conversion & Angela Growth Plan

Date: 2026-09-15
Production: https://journeyexpertbd.com

## Current GSC baseline (last 28 settled days)
- 19 clicks / 545 impressions / 3.49% CTR / avg position 14.32.
- Homepage: 18 clicks / 260 impressions / 6.92% CTR / avg position 11.86.
- ECTS calculator: 256 impressions / 0 clicks / avg position 12.82.
- High-priority queries: `jel` (69 impressions, position 6.55, 0 clicks), `ects calculator` (58 impressions, position 17.67, 0 clicks), `journey expert ltd` (48 impressions, position 3.25, 7 clicks).

## P0 — SEO fixes
1. Enforce one canonical URL per route (no trailing slash except `/`) and 301 redirect slash variants.
2. Optimize homepage title/description around Journey Expert Ltd + study abroad consultancy in Bangladesh, while retaining JEL Study Abroad branding.
3. Optimize `/ects-calculator` title/H1/description around `ECTS Calculator`, `ECTS to Bangladesh credit`, and related conversion intent.
4. Add internal links from homepage, services, blogs and relevant country pages to `/ects-calculator`.
5. Keep sitemap limited to canonical 200/indexable pages and refresh lastmod only when content materially changes.

## P0 — Conversion architecture
Primary CTA sitewide: `Free Profile Assessment`.
Secondary CTA: `Ask Angela`.
Persistent mobile CTA: WhatsApp / Call / Free Assessment.

Lead form minimum fields: name, phone/WhatsApp, current education, desired country, intake, English test status, budget range. Do not ask for unnecessary fields before first conversion.

After submit: show confirmation + Angela handoff + counselor follow-up expectation. Track `lead_form_start`, `lead_form_submit`, `whatsapp_click`, `call_click`, `angela_open`, `angela_qualified_lead`, `appointment_request`.

## P0 — Angela lead-generation behavior
Angela must answer first, then qualify naturally. Never claim guaranteed admission, scholarship, visa, or immigration outcome.

Qualification sequence (progressive, not interrogation):
1. Desired country/program.
2. Highest qualification + result.
3. IELTS/PTE/MOI status.
4. Intended intake.
5. Approximate tuition/living budget.
6. Name + phone/WhatsApp only after providing initial value.

High-intent triggers: asks about eligibility, university shortlist, fees, scholarship, visa documents, application, intake/deadline, counselling, or provides academic profile.

When high intent is detected, Angela should offer: `I can prepare a free preliminary profile assessment and have a JEL counsellor follow up. May I take your name and WhatsApp number?`

Every qualified lead should be persisted to the authoritative CRM with source=`angela`, landing page, campaign/UTM where available, country, intake, qualification summary, English-test status, budget band, transcript summary, timestamp, and consent state.

## P1 — Content expansion
Create high-intent landing pages before generic blog volume:
- Study in UK from Bangladesh — 2026/2027 intakes
- Study in Australia from Bangladesh — requirements, costs, scholarships
- Study in Canada from Bangladesh — current admission pathways and requirements
- Study in USA from Bangladesh — admission, funding and visa preparation
- Study in Malaysia from Bangladesh — affordable universities and total-cost guide
- UK January 2027 Intake for Bangladeshi Students
- UK September 2027 Intake for Bangladeshi Students
- Scholarships for Bangladeshi Students 2027
- IELTS vs PTE vs MOI for Study Abroad
- Student Visa Document Checklist by destination

Each page: unique title/H1, concise answer-first intro, verified current requirements, tuition/cost ranges with dates and sources, university/program examples, FAQs, internal links, breadcrumbs, Organization/FAQ schema where eligible, and a contextual Free Profile Assessment CTA.

## P1 — ECTS content cluster
The calculator already has material impressions. Build supporting pages:
- ECTS to Bangladesh Credit Conversion Guide
- 120/150/180 ECTS Explained for Bangladeshi Students
- Bangladesh Credit Hours to ECTS Calculator & Formula
- ECTS Requirements for European Master's Admissions
Link all pages bidirectionally to `/ects-calculator`.

## Measurement targets (first 90 days)
- Increase non-brand organic impressions and clicks without sacrificing branded CTR.
- Move `jel` toward top 3 and improve its SERP CTR.
- Move `ects calculator` and related terms toward page-one/top-10 visibility.
- Establish measurable visitor -> lead funnel with event instrumentation.
- Track Angela open -> qualified lead -> counselor handoff -> application conversion.

## Guardrails
- No fabricated partner counts, visa-success rates, awards, testimonials or guarantees.
- Current visa/policy claims must be dated and sourced from authoritative institutions/governments.
- No indexable thin/duplicate programmatic pages.
- Preserve production monitoring and Angela regression tests before deployment.
