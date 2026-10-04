# RoyalBlue MFB web app

Responsive web banking frontend for RoyalBlue Microfinance Bank, built from the **RoyalBlue-Dash** Figma file and the **RoyalBlue MFB Digital Banking Platform PRD (v1.0)**. It works on desktop and mobile, with light and deep-purple dark themes.

Where the two disagree, the Figma wins on colours and the PRD wins on typography (all Inter), navigation and flows.

**Stack:** Vite · React 19 · TypeScript · React Router · Tailwind CSS v4 · TanStack Query · lucide-react

> Pair with **master-backend** on branch `pair-program`. Copy `.env.example` to `.env` (`VITE_USE_MOCKS=false`) so the app calls Nest `/api/v1`. Vite proxies `/api` to `http://localhost:3000`. Restart `npm run dev` after changing `VITE_*` — Vite only reads env at startup.

Two mock layers (they are independent):

| Switch | Repo | `true` | `false` |
| --- | --- | --- | --- |
| `VITE_USE_MOCKS` | this app | In-memory `src/api/mocks` — never hits Nest | Browser → Nest |
| `BUDPAY_MOCK` | master-backend | Nest never calls `api.budpay.com` | Nest calls BudPay; KYC/catalogs may still pass-through |

Keep `VITE_USE_MOCKS=false` while pairing even if Nest has `BUDPAY_MOCK=true`. Otherwise banks, plans, and balances never leave the browser fixtures.

---

## Getting started

Requires Node **20.19+** (or 22.12+). There's an `.nvmrc` for `nvm use`.

```bash
npm install
cp .env.example .env
npm run dev            # http://localhost:5173  (API via Vite proxy)
```

| Script                 | What it does                           |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Start the dev server                   |
| `npm run build`        | Type-check, then build to `dist/`      |
| `npm run preview`      | Serve the production build locally     |
| `npm run typecheck`    | TypeScript only                        |
| `npm run lint`         | ESLint                                 |
| `npm run format`       | Prettier (also sorts Tailwind classes) |
| `npm run format:check` | Prettier in check mode, for CI         |

VS Code will suggest the ESLint, Prettier and Tailwind extensions (see `.vscode/`). Format on save is on.

---

## Test logins

Hosted demo: [https://royalblue-web.vercel.app/login](https://royalblue-web.vercel.app/login) (API: `https://royalblue-api.onrender.com`).

Staff and two retail customers are seeded by Nest (`npx prisma db seed`). Staff have **no** personal NUBAN — after login they go to `/admin`, not Home. Seeded customers skip `/sign-up` (password + PIN only, no authenticator).

| Role | Email | Phone | Password | PIN | Lands on |
| --- | --- | --- | --- | --- | --- |
| Administrator | `admin@royalblue.ng` | `08011111111` | `RoyalBlueAdmin1!` | — | Desk — pipeline, freeze, team, recommend + decide |
| Loan officer | `officer@royalblue.ng` | `08022222222` | `RoyalBlueOfficer1!` | — | Desk — claim / recommend (no freeze or final decision) |
| Credit manager | `manager@royalblue.ng` | `08033333333` | `RoyalBlueManager1!` | — | Desk — review, decide, freeze |
| Customer (funded) | `customer@royalblue.ng` | `08044444444` | `RoyalBlueCustomer1!` | `123456` | Home — BVN, NUBAN `8044444444`, ₦185,000 |
| Starter KYC | `starter@royalblue.ng` | `08055555555` | `RoyalBlueStarter1!` | `123456` | Home — no BVN (₦50k CBN cap), NUBAN `8055555555`, ₦32,500 |

Login field: `POST /auth/login` `{ identifier, password }` — email **or** Nigerian number (`080…`, `803…`, `+234…`). Staff have no transaction PIN, so they cannot send customer funds until they set one under **Me → Security**.

### Simulate onboarding

Use a **new** email (not the seeded ones) at [https://royalblue-web.vercel.app/sign-up](https://royalblue-web.vercel.app/sign-up) or local `/sign-up`.

Until Resend is configured, **email OTP and Google Authenticator are skipped**. Hosted signup is:

1. Email
2. Password
3. Personal or business → details
4. BVN / NIN optional (skip for starter ₦50k limits)
5. Confirm → **6-digit transaction PIN**

Then you land on Home. Login is password-only (no authenticator) for these sandbox accounts. OTP + TOTP come back when `RESEND_API_KEY` is set on Nest.

---

## What's built

| Area            | Where                                                   | Notes                                                                                            |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Website         | `/welcome` (where `/` opens), `/terms`, `/privacy`      | Figma "Desktop - 2" exports; HTML CTAs are cropped so they do not sit on the artwork buttons     |
| Login           | `/login`                                                | Email **or** phone + password; authenticator step when TOTP is enabled                            |
| Sign-up         | `/sign-up`                                              | Password → details → PIN. OTP/TOTP only when Nest has Resend |
| Account limits  | `/verification`                                         | BVN via KYC `validate-bvn`. No freeze. Starter ₦50k until BVN/NIN. Tiers 1–3 after.            |
| Home            | `/dashboard` (personal)                                 | Staff never land here. Balance, Send / Receive / Pay / Add money                                 |
| Merchant portal | `/dashboard` (business), `/payments`, `/staff`          | Volume / payout / terminals, live payments, cashier access                                       |
| Profile switch  | Top bar                                                 | Personal ↔ Business. Staff skip this                                                             |
| Transfers       | Modal or `/transfer`                                    | Banks from Nest. Approve with the **6-digit transaction PIN** from sign-up                       |
| Pay bills       | `/pay-bills?type=airtime\|data\|electricity`            | Same PIN on airtime / data / electricity                                                         |
| Savings         | `/savings`                                              | UI only — Nest has no `/savings` yet. With mocks off this screen 404s/empty unless you mock it |
| Cards           | `/cards`                                                | Nest lockup from NUBAN last 4; freeze/controls. PAN reveal is 422                                |
| Loans           | `/loans`, `/loans/apply`                                | Live products + paper borrower/guarantor pack + uploads                                          |
| Credit desk     | `/admin`, `/admin/queue`, `/admin/accounts`, `/admin/team`, `/admin/applications/:id` | Role-specific workspace (`features/admin`)                          |
| Me / settings   | `/settings`, `/settings/profile`, `/security`, `/notifications`, `/payments` | OPay-style hub. Staff: security, notifications, legal — no next-of-kin |
| Transactions    | `/transactions`                                         | Search, filters, receipt                                                                         |
| Coming soon     | Invest, Insights, Rewards, Refer, Learn, Help           | Placeholder pages from nav config                                                                |

**Layout:** phones get a top bar and bottom tabs. Personal: Home, Transfers, Savings, Cards, More. Business: Dashboard, Payments, Transfers, Staff access, More. Staff: Desk plus role links (Pipeline / Review / Accounts / Team). At `lg` (1024px) and up, a royal blue sidebar replaces the tabs. Nav: `components/layout/navigation.ts`, `useWorkspaceNav.ts`.

**Demo tips:** with **web** mocks on, switch to the business profile for the merchant portal; a new payment arrives every 8 seconds; the 6-digit transaction PIN from sign-up approves a transfer. With mocks **off**, **Add money → Bank transfer** shows the BudPay VA; **Debit card** opens BudPay checkout; **BudPay sandbox top-up** posts a test VA credit. Bank list and cellular plans come from Nest (live BudPay or Nest sandbox fallback) — empty lists usually mean Nest cannot reach `api.budpay.com` or Vite was started before `VITE_USE_MOCKS=false`.

---

## Project structure

```
src/
  api/                 Everything that talks to the backend
    client.ts          fetch wrapper: base URL, auth + profile headers, errors
    reference.ts       Static reference data (mobile networks)
    types.ts           Domain types the UI uses
    services/          One file per API area (auth, accounts, transfers…)
    mocks/data.ts      Sample data used while VITE_USE_MOCKS is on
    hooks.ts           React Query hooks + query keys
  app/
    App.tsx, router.tsx, guards.tsx   Feature pages are code-split in router.tsx
    providers/         Theme, auth, toast, React Query, active profile
  components/
    ui/                Design-system primitives (Button, Card, TextField, Modal…)
    layout/            App shell, sidebar, top bar, bottom tabs, auth layout
      navigation.ts    Single source of truth for routes and nav items
  features/            One folder per product area
    <feature>/
      <Feature>Page.tsx
      components/      Components used only by this feature
      lib/             Pure logic (e.g. loan maths, fees)
  lib/                 App-wide helpers (formatting, theme, storage, cn)
  assets/              Images imported by code (see src/assets/README.md for sources)
  styles/              Tailwind entry, design tokens
```

**Rules of thumb**

- Components never call `fetch`. They use hooks from `@/api/hooks`, which call `@/api/services/*`.
- Put code in the feature that owns it. Move it to `components/ui` or `lib` only once a second feature needs it.
- Import with the `@/` alias, never long `../../` paths.
- No hard-coded colours in components. Use the token classes below.

---

## Design tokens and theming

Tokens are defined in `src/styles/index.css`. Raw values sit in `--rb-*` CSS variables, and `[data-theme='dark']` swaps them. Tailwind reads them through `@theme inline`, so the same class works in both themes. Components almost never need `dark:` variants.

| Class                                                | Use                                                     |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `bg-bg`                                              | Page background                                         |
| `bg-surface` / `bg-surface-2` / `bg-surface-3`       | Cards / fields and subtle fills / tracks                |
| `text-ink` / `text-ink-2` / `text-ink-3`             | Primary / secondary / muted text                        |
| `border-line`                                        | Hairlines and card borders                              |
| `text-brand`                                         | Headings and key figures (navy in light, lilac in dark) |
| `bg-primary`, `bg-primary-soft`, `text-primary-text` | Signal red actions and states                           |
| `text-success`, `bg-success-soft`                    | Money in, paid, verified                                |
| `text-warning`, `bg-warning-soft`                    | Pending                                                 |
| `bg-navy`                                            | Balance card and auth background (same in both themes)  |
| `text-tint-airtime/data/bills/card/loans`            | Service icon tints (Figma variables)                    |
| `rounded-field` / `-tile` / `-card` / `-panel`       | 10 / 14 / 20 / 26px radii                               |

Figma sources: navy `#1B194D`, heading navy `#272570`, red `#C93C38`, body grey `#5A5A5A`, field grey `#F5F5F5`.

**Typography:** Inter throughout (PRD). Headings use `font-semibold tracking-tight`; amounts use the `tabular` utility so digits line up.

**Theme switching:** `ThemeProvider` saves the user's choice in `localStorage` (`rb.theme`). If there's no saved choice, it follows the device setting. A small script in `index.html` applies the theme before first paint, which prevents a flash of the wrong theme.

### Logo

`components/ui/Logo.tsx` inlines the official lockup (`public/royalblue-lockup.svg`) so the lettering can switch between navy and white. Use `compact` to drop the "Microfinance Bank" line at small sizes. The favicon is `public/favicon.svg`.

---

## Connecting the API

On `pair-program`, live mode talks to Nest `/api/v1`. The browser never holds the BudPay secret. Shapes and pass-throughs are documented in **master-backend README → External services**.

| Screen | Nest | Upstream |
| --- | --- | --- |
| Login / MFA | `POST /auth/login` `{ identifier, password }`, `/auth/login/mfa` | Email or NG phone. OTP is Nest + Resend (not BudPay) |
| Sign-up | `POST /auth/start`, `/auth/mfa/begin`, `/auth/complete` (`pin`, `totpCode`) | Identity: KYC v2 `validate-bvn` / `validate-id` (sandbox names if unpaid) |
| Me | `GET/PATCH /profile`, `GET /auth/security`, `PATCH /auth/password\|pin\|alerts`, TOTP begin/confirm | Prisma only |
| Dashboard | `GET /accounts/primary` | Dedicated VA lookup |
| Add money — bank | NUBAN on the account | `POST /api/v2/dedicated_virtual_account` at provision |
| Add money — card | `/accounts/card-topup` then `/verify` | `transaction/initialize` → hosted checkout |
| Transfers | `/transfers/banks`, name-enquiry, `/outward` `{ pin }` | Live `bank_list` → `{ code, name }[]`. PIN required. |
| Bills | `/bills/data/plans/:provider` etc. `{ pin }` on pay | Catalogs from BudPay (or Nest sandbox list). PIN required. |
| Loans | `/applications`, `/applications/pack` | Bureau + payroll are **Nest mocks** (score 680; `wacs_mock_*`) until CRC / WACS keys |
| Cards | `GET /cards`, `PUT /cards/:id/freeze` | Local lockup; not BudPay issuing |
| Credit desk | `/staff/summary`, `/applications`, `/accounts`, `/team` | Prisma + mock bureau snapshot on the file |
| Savings | none | Still frontend-only |

1. Nest: `BUDPAY_MOCK=true` **or** test secret + `BUDPAY_MOCK=false` (outbound network required for live catalogs).
2. This app: `.env` with `VITE_USE_MOCKS=false`, `VITE_API_BASE_URL=/api/v1`, then restart Vite.
3. Savings has no Nest route. Card PAN reveal is refused (422). Transfers and bills must send the 6-digit `pin` from onboarding.

### Still UI-only / next views

These screens exist in the app but are not fully backed by Nest, or are the natural next Figma work:

| Area | Status |
| --- | --- |
| Savings / vaults | UI only — no `/savings` on Nest |
| Physical card order | Placeholder; virtual freeze/controls are live |
| Card PAN / CVV reveal | Always 422 (processor-hosted) |
| Password reset | Toast “coming soon” |
| Invest, Insights, Rewards, Refer, Learn, Help | `comingSoon` placeholders in `navigation.ts` |
| Passkey / biometric approve | Not wired; money movement is PIN-only |

When adding a screen: `features/<name>`, `navigation.ts`, `router.tsx`, then `src/api/services` + `hooks.ts`. Do not call BudPay from the browser.

Amounts in the UI are **naira**. After card checkout BudPay returns to `/dashboard?reference=…&status=success`; Home verifies and refreshes.

---

## Deploying

This is a single-page app: React Router handles URLs in the browser, so the host must serve `index.html` for every path that isn't a real file. Without that, opening `/loans` directly (or refreshing on it) returns the host's 404.

- **Vercel:** `vercel.json` proxies `/api/*` to `https://royalblue-api.onrender.com` and rewrites other paths to `/index.html`. Production builds bake `VITE_USE_MOCKS=false` and `VITE_API_BASE_URL=https://royalblue-api.onrender.com/api/v1` from `.env.production`. CORS already allows `*.vercel.app`.

- **Netlify:** add `public/_redirects` with `/*  /index.html  200`.
- **Other hosts:** configure a fallback to `index.html`.

Signed-out visitors who open a deep link go to `/login` first, then land on the page they asked for.

---

## Adding a screen

1. Create `src/features/<name>/<Name>Page.tsx`, plus a `components/` folder if it needs one.
2. Add its path and nav entry in `components/layout/navigation.ts`.
3. Register the route in `app/router.tsx`. If it was in `comingSoon`, remove it from there.
4. Add types, a service function and a hook in `src/api/` for any data it needs.

---

## Conventions

- **Components:** named exports, PascalCase files, one main component per file.
- **Styling:** Tailwind classes only. Combine conditional classes with `cn()`. For a link that should look like a button, use `buttonClass()` instead of nesting a `<button>` inside a `<Link>`.
- **State:** server data lives in React Query. Local UI state uses `useState`. App-wide concerns (theme, auth, toasts, active profile, the transfer modal) are React context in `app/providers` or the owning feature.
- **Copy:** sentence case, plain words, and messages that say what happened and what to do next.
- **Accessibility:** icon-only buttons need an `aria-label`. Toggles use `aria-pressed`. Dialogs use `Modal`, which handles Escape and focus.
