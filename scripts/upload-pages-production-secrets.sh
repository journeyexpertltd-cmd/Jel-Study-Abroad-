#!/usr/bin/env bash
set -euo pipefail

# Secret-safe Cloudflare Pages production upload.
# Values are read silently and passed through stdin to Wrangler.
# This script never prints, stores, or places secret values on command lines.

PROJECT_NAME="jel-study-abroad"
WRANGLER=(npx --yes wrangler@4.124.0 pages secret put --project-name "$PROJECT_NAME")

read_secret() {
  local name="$1"
  local value
  printf 'Enter production value for %s: ' "$name" >&2
  IFS= read -r -s value
  printf '\n' >&2
  if [[ -z "$value" ]]; then
    echo "Refusing to upload an empty value for $name." >&2
    exit 1
  fi
  printf '%s\n' "$value" | "${WRANGLER[@]}" "$name"
  unset value
}

cat >&2 <<'NOTICE'
This uploads production secrets to the Cloudflare Pages project jel-study-abroad.
Use production values only. Configure Preview values separately in Cloudflare.
Never paste a secret into the command itself.
NOTICE

if ! "${WRANGLER[@]}" --help >/dev/null 2>&1; then
  echo "Wrangler is unavailable. Run 'npx wrangler login' first if authentication is required." >&2
  exit 1
fi

read_secret GEMINI_API_KEY
read_secret SUPABASE_SERVICE_ROLE_KEY
read_secret SSLCOMMERZ_STORE_ID
read_secret SSLCOMMERZ_STORE_PASSWORD

echo "Uploaded four production secret bindings to Pages project ${PROJECT_NAME}." >&2
echo "Configure non-secret variables separately: SUPABASE_URL, SSLCOMMERZ_IS_SANDBOX=false, SSLCOMMERZ_API_BASE, APP_URL=https://journeyexpertbd.com, APP_VERSION=<commit-sha>." >&2
