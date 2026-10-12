# JEL Angela — Meta App Review submission pack
Date: 12 October 2026
App: JEL Angela Customer Assistant
App ID: 2593523734425237
Company: Journey Expert Limited (JEL), Bangladesh
Facebook Page: Journey Expert BD (Page ID: 1183671364826520)
Website: https://journeyexpertbd.com
Production webhook: https://journeyexpertbd.com/api/meta/webhook

## Current state and critical pre-submission check
- The Meta app has been marked Published in its dashboard, but the App Review submission was shown as **Not submitted** in the owner's latest screenshot.
- Messenger backend is deployed from GitHub PR #146 in Cloudflare Pages.
- The Cloudflare environment has META_APP_SECRET, META_WEBHOOK_VERIFY_TOKEN, META_PAGE_ID and META_PAGE_ACCESS_TOKEN configured as of the last connector audit. Never paste these secret values into the review text or screenshots.
- **META_AUTOREPLY_ENABLED=false** remains the production setting. Do not claim automatic Messenger replies are live or demonstrate a fake bot interaction.
- Verify the Messenger Page webhook subscription includes `messages`; the owner's click to Confirm is not independently confirmed.
- Verify the **actual subscribed callback URL** shown in Meta is the same as the production webhook. A green Configure Webhooks check alone does not establish which URL is saved.
- Test live webhook verification and a real inbound-to-outbound reply with an authorized app-role test account *before* claiming functionality in the review. Activate auto-reply only during an approved controlled test, or preferably add a test-account allowlist first.
- Access for customers without an app role may require Meta approval / Advanced Access; publishing an app is not equivalent to permission approval.

## Proposed App Review description — pages_messaging
"JEL Angela Customer Assistant provides customer-initiated support for Journey Expert BD, a Facebook Page managed by Journey Expert Limited in Bangladesh. When a Facebook user sends a Messenger message to the Page, the subscribed Meta webhook receives the incoming text. Our backend validates Meta's request signature and passes the user's question to Angela, our customer-service AI assistant. Angela answers in Bangla or English about JEL's verified travel and study-abroad services, such as air ticketing, visa-document assistance, Hajj and Umrah, tours, hotels and university admissions guidance. The reply is sent to the same user's Messenger conversation using the Page messaging API. Users may contact our human team using the published hotline/WhatsApp. We respond to user-initiated conversations and do not use this permission for unsolicited promotional blasts, bulk messaging or scraping. We do not guarantee visa approvals, bookings or fares."

## Proposed App Review description — pages_manage_metadata
"We use pages_manage_metadata to connect our authorized Journey Expert BD Facebook Page with Meta's Webhooks and subscribe the Page to the messages event. This delivers user-initiated Messenger conversations securely to the JEL Angela support backend. A valid Page administrator completes the Page connection in Meta's Messenger API Settings. This permission is necessary for Page webhook subscription and integration maintenance; the app does not modify unrelated Page information."

## Proposed App Review description — pages_show_list
"We use pages_show_list to allow the authorized Journey Expert business administrator to identify and select a Facebook Page they manage for Messenger customer support integration. Our deployment is currently configured for the Journey Expert BD Page (ID 1183671364826520). We do not access Pages the administrator did not authorize."

## Other permission requests on the Meta screen
Earlier screenshots included `pages_utility_messaging` and `business_management`. Do not invent a utility-template or business-asset-management workflow. Review each permission's dependency and intended use in Meta. Remove unneeded requests rather than invent unsupported features. Keep permissions required by Meta's chosen Messenger use case.

## Reviewer reproduction instructions (use after successful test)
1. Open the published Messenger-capable Facebook Page for Journey Expert BD (Page ID 1183671364826520).
2. With the provided eligible test account / app Tester role if needed for non-Advanced access, send the Page: "Hello Angela. What services does Journey Expert Limited provide?"
3. Verify the incoming `messages` webhook event and that Angela's English reply arrives in the *same* Messenger thread.
4. Send: "হ্যালো অ্যাঞ্জেলা, তোমরা কী কী সেবা দাও?"
5. Verify an appropriate Bangla text response.
6. Send a follow-up question about visa guarantees and verify Angela does not promise approval.
7. If review is testing the Page connection workflow, an authorized business administrator can demonstrate Meta Dashboard → Messenger API Settings → Page connection and `messages` webhook subscription. Do not give reviewers unrestricted business admin credentials.

These steps are the **intended tested workflow**, not a declaration that live messaging already works. Only include in final submission after reproducing it.

## Screencast outline
- Show JEL Angela Meta App and connected Journey Expert BD Page.
- Show Messenger API Settings and the subscribed `messages` field.
- Show a genuine, contemporaneous Messenger conversation with a permitted test account: user sends a new message, Angela replies; no edited still images.
- Demonstrate both Bangla and English.
- Show the webhook/backend's role without revealing App Secret, Page Access Token, Verify Token, private end-user data or unrestricted credentials.
- A video uploaded to Meta does not alone establish an approved permission. Complete each corresponding description, screencast and acknowledgement required by Meta's actual form.

## Internal reviewer submission checklist
- [ ] `messages` shows subscribed for Journey Expert BD.
- [ ] Actual Meta Callback URL matches `https://journeyexpertbd.com/api/meta/webhook`.
- [ ] Verified GET challenge and signed POST processing work on production.
- [ ] Test-account inbound Messenger event reaches backend.
- [ ] A real outbound Messenger reply is received while test mode is safely enabled.
- [ ] Reviewer screen recording matches actual behavior.
- [ ] App Review description for each required permission is saved.
- [ ] Minimum requested permission set selected.
- [ ] Necessary app/business verification completed.
- [ ] Then submit through Meta App Review UI and record Submitted/In Review status.
- [ ] Leave mass-customer auto replies disabled until permissions and end-to-end tests are confirmed.

## Security
Do not share App Secret, Page Token, WhatsApp token, login passwords or OTPs through chat, GitHub, screenshots or screencasts. Keep production replies disabled until policy, permissions and controlled testing permit activation.
