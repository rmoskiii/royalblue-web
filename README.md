# RoyalBlue MFB web app

Responsive web banking frontend for RoyalBlue Microfinance Bank, built from the **RoyalBlue-Dash** Figma file and the **RoyalBlue MFB Digital Banking Platform PRD (v1.0)**. It works on desktop and mobile, with light and deep-purple dark themes.

Where the two disagree, the Figma wins on colours and the PRD wins on typography (all Inter), navigation and flows.

**Stack:** Vite · React 19 · TypeScript · React Router · Tailwind CSS v4 · TanStack Query · lucide-react

> Pair with **master-backend** on branch `pair-program`. Copy `.env.example` to `.env` (`VITE_USE_MOCKS=false`) so dashboard, payments, transfers, bills, and transactions call `/api/v1`. Vite proxies `/api` to `http://localhost:3000`. Login and sign-up demo prefill is off in live mode.

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

## What's built

| Area            | Where                                                   | Notes                                                                                            |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Website         | `/welcome` (where `/` opens), `/terms`, `/privacy`      | Figma "Desktop - 2" exports with clickable buttons (`features/landing/sections.ts`)              |
| Login           | `/login`                                                | Email and password                                                                               |
| Sign-up         | `/sign-up`                                              | PRD FR-01: phone → SMS code → BVN/NIN → confirm fetched details → login details → account number |
| Home            | `/dashboard` (personal profile)                         | Balance with privacy toggle; Send, Receive, Pay bills, Add money; transactions + quick transfer  |
| Merchant portal | `/dashboard` (business), `/payments`, `/staff`          | PRD View 2: volume / payout / terminals, live payments table, POS status, cashier access         |
| Profile switch  | Top bar                                                 | PRD FR-04: Personal ↔ Business. Switching refetches everything for the new profile               |
| Transfers       | Modal (from nav, Home, or `/transfer`)                  | PRD View 3: searchable banks, name lookup, free-transfer fee indicator, PIN pad or passkey       |
| Pay bills       | `/pay-bills?type=airtime\|data\|electricity`            | PRD FR-07: networks, data bundles, meter validation, PIN approval, electricity token receipt     |
| Savings         | `/savings`                                              | PRD View 4: live interest, vault cards with progress rings, new vault, returns calculator        |
| Cards           | `/cards`                                                | PRD View 5: 3D virtual card, show details/CVV, freeze, controls, physical card order + tracking  |
| Loans           | `/loans`                                                | Active loan + schedule, repayment calculator, products, how it works                             |
| Transactions    | `/transactions`                                         | Search, filters, grouped by day, table-style rows when wide, receipt sheet                       |
| Account limits  | `/verification`                                         | PRD View 6: tier limits, 3-step upgrade (BVN, ID + selfie via webcam, proof of address)          |
| Coming soon     | Invest, Insights, Rewards, Refer, Learn, Help, Settings | Placeholder pages, generated from the nav config                                                 |

**Layout:** phones get a top bar and bottom tabs. Personal: Home, Transfers, Savings, Cards, More. Business: Dashboard, Payments, Transfers, Staff access, More. At `lg` (1024px) and up, a royal blue sidebar with a profile badge replaces the tabs. Navigation for both profiles lives in `components/layout/navigation.ts`.

**Demo tips (mock mode):** switch to the business profile from the top bar to see the merchant portal; a new payment arrives in the live table every 8 seconds. Any 4-digit PIN approves a transfer or bill.

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

On `pair-program`, live mode talks to Nest `/api/v1` (see master-backend). Dashboard, payments, transfers, bills, and transactions are wired.

1. Run master-backend with `BUDPAY_MOCK=true` for sandbox, or `BUDPAY_MOCK=false` plus BudPay merchant keys for production.
2. Copy `.env.example` to `.env` (`VITE_USE_MOCKS=false`, `VITE_API_BASE_URL=/api/v1`).
3. Remaining TODOs (savings, cards, loans, KYC uploads, passkeys) still use mocks until those Nest modules exist.

Amounts are in **naira**. If the API uses kobo, convert in the services layer.

---

## Deploying

This is a single-page app: React Router handles URLs in the browser, so the host must serve `index.html` for every path that isn't a real file. Without that, opening `/loans` directly (or refreshing on it) returns the host's 404.

- **Vercel:** `vercel.json` rewrites every path to `/index.html`. Real files such as `/assets/*` and `/favicon.svg` are still served as normal, because Vercel checks the filesystem before applying rewrites.
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
