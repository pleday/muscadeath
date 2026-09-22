# Muscadeath Festival — Agent Guide

Replacement website for the Muscadeath metal festival (Vallet, France). React
+ Vite + TypeScript (strict) + Tailwind CSS v4, with a config-driven admin/CMS,
a Stripe/Supabase e-shop, and static hosting on Netlify.

## Architecture

- **Content model**: `src/config/site.config.ts` holds all default text/image
  paths (typed). `src/context/ConfigContext.tsx` merges: defaults →
  `localStorage` override → published content from the Supabase `site_content`
  table (row `id='main'`, JSON `{ config, theme }`). Admin tabs call
  `updateConfig()` (local) then `publish()` (writes to Supabase).
- **Context split pattern**: every context is split into 3 files —
  `XContext.tsx` (provider component only), `xContextInstance.ts` (the
  `createContext` object + types, no components), `useX.ts` (the hook). This
  is required for Vite Fast Refresh to work; don't merge them back.
- **Admin** (`src/admin/`): `/admin` route, Supabase email/password auth (no
  public sign-up — create users manually in Supabase Authentication). Tabs are
  grouped in `AdminPanel.tsx` (`tabGroups`); each tab is its own file.
- **Theming**: CSS custom properties on `:root` (see `src/config/theme.ts`,
  applied in `main.tsx`), consumed via `bg-[var(--color-x)]` etc.
- **Image uploads**: always go through `readImageFileForUpload()`
  (`src/lib/file.ts`) which compresses to a data URL — never store raw
  uploads, `localStorage` quota errors ensue otherwise.

## Build & dev

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build (must pass before every deploy)
npm run lint     # oxlint
```

`.env.local` (gitignored) needs `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`VITE_GOOGLE_MAPS_API_KEY` — see `.env.example`. Without Supabase configured,
the site still works fully in local-only mode (admin changes stay in
`localStorage`).

## Database & payment (Supabase)

- `supabase/schema.sql`: `site_content` table (CMS content), RLS: public read,
  authenticated write.
- `supabase/orders.sql`: `orders` table (e-shop orders), columns include
  `status` (`pending`/`processed`/`refunded`) and `payment_intent_id`. RLS:
  authenticated (admin) can read/update, only Edge Functions (service role)
  can insert. Re-running this file is safe/idempotent.
- `supabase/functions/` (Deno Edge Functions, deploy with
  `--no-verify-jwt`):
  - `create-checkout-session`: real Stripe Checkout session.
  - `stripe-webhook`: verifies signature, inserts the paid order, sends the
    confirmation email.
  - `mock-checkout`: inserts a fake "paid" order with no real payment (used
    by the cart's "Mode test" button) — lets you test the whole sales flow
    (admin management, emails) without Stripe fully configured.
  - `refund-order`: admin-only (verifies the caller's Supabase session JWT).
    Mock orders (`stripe_session_id` starting with `mock_`) are refunded
    locally; real orders trigger an actual Stripe refund.
  - `_shared/email.ts`: sends the order confirmation email via the Resend
    API, styled with the currently published theme/logo (fetched from
    `site_content`). Logos must be a real `http(s)` URL — reject `data:` URIs
    (Gmail strips them and/or clips oversized emails).
  - **`SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are
    auto-injected by Supabase into every Edge Function — never set them as
    secrets manually (the CLI rejects the `SUPABASE_` prefix anyway).**
  - Secrets you DO need to set (`supabase secrets set ...`):
    `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL` (also used to
    resolve the email logo), `RESEND_API_KEY`, `ORDER_FROM_EMAIL`.
- Frontend calls: `src/lib/checkout.ts` (`createCheckoutSession`,
  `createMockOrder`, `refundOrder`) — thin wrappers around
  `supabase.functions.invoke(...)`.

## Deployment

- Hosting: Netlify, static build (`dist/`), **no GitHub auto-deploy
  configured** — every deploy is manual:
  ```bash
  npm run build
  npm exec --yes netlify-cli -- deploy --prod --dir=dist
  ```
- `npx` is broken on some dev machines used for this project (0-byte/permission
  denied binary) — always use `npm exec --yes <pkg> -- <args>` instead of
  `npx <pkg> <args>`.
- Supabase CLI login can't be automated non-interactively in a sandboxed
  agent environment (`supabase login` needs a browser). To deploy Edge
  Functions or set secrets without an interactive browser, generate a
  personal access token at supabase.com/dashboard/account/tokens and use
  `SUPABASE_ACCESS_TOKEN=... npm exec --yes supabase -- <command>` — but
  never type/paste that token as the agent, always have the human run it
  directly since it's a secret.

## Git conventions

Commit messages MUST match: `type(scope): subject [Ticket: XXX-123]` where
`type` ∈ `build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test|Publish`
(enforced by a commit-msg hook). Use `[Ticket: WEB-1]` as a placeholder ticket
if none is given.

## Google Maps

Address fields (`src/admin/PlacesField.tsx`) use Google Places Autocomplete
when `VITE_GOOGLE_MAPS_API_KEY` is set, else fall back to plain text. Three
APIs must be enabled on the Google Cloud project: **Maps JavaScript API**,
**Places API**, **Maps Embed API** — missing any one causes runtime errors
even if the key itself is valid.
