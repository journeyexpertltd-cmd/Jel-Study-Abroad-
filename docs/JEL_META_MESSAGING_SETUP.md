# JEL Angela Meta Messaging Webhook — Operator Setup

Target app: **JEL Angela Customer Assistant** (Meta App ID `2593523734425237`).
Production: `https://journeyexpertbd.com/api/meta/webhook` (Cloudflare Pages, `jel-study-abroad`).

## What is implemented

- Cloudflare Pages Function `functions/api/meta/webhook.ts`.
- Meta GET verification handshake (`hub.mode`, `hub.verify_token`, `hub.challenge`).
- HMAC-SHA256 verification using the **raw** POST body and the Meta App Secret.
- Restricted incoming text parsing for Facebook Messenger, Instagram, and WhatsApp Cloud API.
- Replies reuse the **existing Angela Gemini chat endpoint** and its anti-fabrication rules. Meta channels send text; this does not enable voice messaging.
- Never process unverified POST data, never log tokens or message contents, and never auto-reply until expressly enabled.
- Optionally bind KV namespace as `META_MESSAGE_DEDUPE` to reduce duplicates from webhook retries. KV is best-effort (not an exactly-once queue); for high-volume use add a proper queue or durable deduplication.
- No raw message history is stored by this webhook. Existing app data-handling policies still apply.

## Cloudflare configuration (do NOT commit secrets)

Cloudflare dashboard → Workers & Pages → `jel-study-abroad` → Settings → Variables and Secrets → Production. Add **encrypted secret** values:

| Name | Value source |
|---|---|
| `META_WEBHOOK_VERIFY_TOKEN` | Exactly the same long random value entered in the Meta Webhooks setup; create it in a password manager, not in source control. |
| `META_APP_SECRET` | App Settings → Basic → App Secret (Meta only). |
| `META_PAGE_ACCESS_TOKEN` | Page access token for connected JEL Facebook Page with Messenger permissions. |
| `META_PAGE_ID` | Numeric Facebook Page ID (plain environment variable). |
| `META_IG_ACCESS_TOKEN` | Approved Instagram API account access token with messaging scope. |
| `META_IG_ACCOUNT_ID` | Matching Instagram Professional account numeric ID (plain variable). |
| `META_WHATSAPP_TOKEN` | Meta WhatsApp Cloud API system-user / business access token with appropriate permissions. |
| `META_WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Cloud API **Phone Number ID**, not the public telephone number (plain variable). |
| `META_AUTOREPLY_ENABLED` | `false` during verification and review; change to `true` only after credentials, permissions, testing and business consent. |

The webhook can verify Meta's subscription with the first two secrets only. Every channel's send credentials and permissions are separately required for automated replies. Never show tokens in screenshots or chat messages.

## Meta Developer App Dashboard

1. Published app → Use Cases → Messenger → Webhooks. Enter Callback URL `https://journeyexpertbd.com/api/meta/webhook` and the value from `META_WEBHOOK_VERIFY_TOKEN`. Subscribe to Page **messages** events. Connect the exact Facebook Page and authorize required Page messaging access.
2. Instagram Messaging → Configure its webhook (same Callback URL and verify token if the app/dashboard permits a shared endpoint). Subscribe to Instagram message events. Connect the Instagram Professional account and obtain the right access token and messaging permission. With Instagram Login-based API, the sender is `https://graph.instagram.com/v25.0/me/messages`; Facebook Login configurations can require a different route, so confirm the chosen use case.
3. WhatsApp → Configuration → Webhook Callback URL and Verify Token. Subscribe to the **messages** field, connect a valid WABA / Phone Number ID and token. Verify status via Meta dashboard. Use the approved WhatsApp Cloud API—not the ordinary `wa.me` chat link—for bot auto-replies.
4. Run sandbox user-initiated text conversations in each channel, check reply language and security, and only then enable `META_AUTOREPLY_ENABLED=true`.
5. Confirm correct App Review status and required permissions before relying on customer-wide access.

## Verification tests

- `GET /api/meta/webhook` without signed handshake should respond 403 (or 503 if verify token not configured).
- Meta's verification GET with the correct token must echo `hub.challenge` as text.
- Unsigned or invalidly signed POST must return 403.
- Validly signed POST should return `EVENT_RECEIVED` and HTTP 200. With `META_AUTOREPLY_ENABLED=false` it MUST NOT send messages.
- The connected Page/IG account ID/WhatsApp Phone Number ID must match the configured identifiers before outbound responses.
- Confirm Meta webhook subscription and send success in Meta dashboard. Deploy success alone does not show the app has necessary permissions or tokens.

## Limitations and safeguards

- Webhook message replies rely on the configured token, permissions, platform windows and provider rate limits. For Facebook, standard-response messaging is subject to the user-initiated conversation window.
- Text-only MVP: attachments, stories, template broadcasts, marketing campaigns, proactive messaging and group conversations are not supported. No voice/WhatsApp audio automation in this change.
- Cloudflare Functions return 200 to valid events rapidly and use background processing where supported. Transient delivery failure is not recovered automatically; production-grade queues/retry tracking should be added before high-volume usage.
- WhatsApp Cloud API can have provider costs after free allowances. No paid provider is activated by this code change.
- Data-deletion instructions: `https://journeyexpertbd.com/data-deletion/`. This is a human-request instruction page, NOT an automatic deletion callback.
