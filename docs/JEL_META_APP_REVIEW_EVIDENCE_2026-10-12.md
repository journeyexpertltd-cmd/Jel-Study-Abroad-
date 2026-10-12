# JEL Angela — Meta App Review readiness pack (12 October 2026)

App: JEL Angela Customer Assistant (Meta App ID `2593523734425237`).
Business: Journey Expert Limited (Bangladesh).
Facebook Page: Journey Expert BD (Page ID `1183671364826520`).
Messenger backend callback: `https://journeyexpertbd.com/api/meta/webhook`.
Privacy policy: `https://journeyexpertbd.com/privacy/`.
Data deletion instructions: `https://journeyexpertbd.com/data-deletion/`.
Company contact: `journeyexpertbd@gmail.com`, hotline `+8801926400400`.

## Submission status — do not overstate
- Meta App Publish was shown as Published in the owner's dashboard.
- Last supplied Meta App Review screenshot showed **Not submitted**.
- GitHub PR #146 merged and Cloudflare Pages production deploy succeeded.
- Meta app and Page access tokens are stored as Cloudflare secrets; never include them in review text or videos.
- Messenger webhook has a signed POST receiver and GET verification handler. Meta's green setup indicators alone do **not** prove the expected callback URL or live delivery.
- Automatic replies are **OFF** through `META_AUTOREPLY_ENABLED=false`; do not claim to the reviewer that public users are receiving automated replies. A functional demonstration is required before submission.
- The last Messenger screenshot did not conclusively show a completed `messages` field subscription. Verify first.

## Permission use-case text (copy/edit only if demonstrably true)

### pages_messaging
"Journey Expert Limited operates the Journey Expert BD Facebook Page. Visitors initiate Messenger conversations to ask about study abroad, air tickets, visa-document support, hotels, Hajj and Umrah and other published services. JEL Angela receives the incoming Messenger text through Meta's Page messaging webhook, generates a concise Bangla/English customer-service reply using the company's documented service information, and sends the response back to the same user in Messenger. The assistant does not initiate unsolicited promotional messages. When pricing, live availability, visas or sensitive matters require verification, customers are referred to the human team. This permission is requested for user-initiated customer support on our own Page."

### pages_manage_metadata
"JEL needs Page webhook subscription and event-management access to receive incoming Messenger `messages` events for the connected Journey Expert BD Page. The app uses Page identifiers and Meta callback verification to configure and maintain that event subscription. It does not change unrelated Page content or settings."

### pages_show_list
"The Page connection workflow requires identifying the Facebook Pages that an authorized business administrator may manage so the correct Journey Expert BD Page can be selected and its messaging subscription configured. Access is used for Page selection and verification, not harvesting unrelated Pages or personal data."

**Important:** Current backend is preconfigured with an existing Page ID; no custom public Page-picker UI was confirmed in the reviewed code. If Meta requires a Page picker demonstration for `pages_show_list`, implement and demonstrate that flow before asserting this feature is live.

## Reviewer reproduction steps (only after passing internal test)

1. Open the Journey Expert BD Facebook Page's Messenger conversation as an authorized test participant.
2. Send a text message such as: "হ্যালো, আমি UK-তে পড়তে চাই। আপনারা কীভাবে সাহায্য করেন?"
3. In Cloudflare logs, establish that the incoming webhook reached `/api/meta/webhook` with valid signature. Do not expose message bodies or secrets in logs.
4. Confirm the assistant responded within Meta's allowed customer-service messaging window and that the actual delivered text appears in the **same Messenger chat**.
5. Repeat in English: "What services do you offer? How can I contact JEL?"
6. Demonstrate opt-out/human handoff and the public privacy/data deletion instructions as applicable.
7. Screen recording should capture Page connection or permission grant, new customer message, actual bot response delivery, and the absence of unsolicited outreach. Avoid recording or sharing tokens.

## Before clicking Submit for Review

- Verify `messages` is subscribed for Page `1183671364826520`.
- Verify Meta's configured callback points to `https://journeyexpertbd.com/api/meta/webhook` and the Meta verification flow succeeded.
- Validate permitted Page messaging access and that a test user actually receives an outbound reply.
- Keep unsolicited messaging and sensitive data out of automated replies.
- Complete reviewer video, allowed usage, data handling, business verification where requested, and relevant permission explanations.
- If unused, remove extra **review requests** such as `pages_utility_messaging` (utility templates) and `business_management` (business-asset management). Do not remove anything required by other implemented use cases without checking dependencies.
- Check public URLs load successfully in a real browser.
- Only submit claims supported by a live demonstration; the user/business owner must review final representation to Meta.

## Secrets and cost
No secrets belong in Github, screenshots or ChatGPT messages. Meta Messenger, Instagram and WhatsApp may have different limits, reviews and pricing. This document does not enable paid APIs or auto-replies.
