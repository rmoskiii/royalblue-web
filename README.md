# RoyalBlue MFB web app

Responsive web banking frontend for RoyalBlue Microfinance Bank, built from the **RoyalBlue-Dash** Figma file. It works on desktop and mobile, with light and deep-purple dark themes.

**Stack:** Vite · React 19 · TypeScript · React Router · Tailwind CSS v4 · TanStack Query · lucide-react

> The app runs on **mock data** until the API contract is connected. You can log in with any email and password.

---

## Getting started

Requires Node **20.19+** (or 22.12+). There's an `.nvmrc` for `nvm use`.

```bash
npm install
cp .env.example .env   # optional: mocks are on by default
npm run dev            # http://localhost:5173
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

| Area         | Route(s)                                                                                            | Notes                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Auth         | `/login`, `/sign-up`, `/verify-email`, `/create-password`                                           | Sign-up flow passes the email between steps via router state         |
| Home         | `/`                                                                                                 | Balance, quick services, tier upgrade prompt, active loan, insights  |
| Transfer     | `/transfer`                                                                                         | Name enquiry, NIP fee, beneficiaries, PIN confirmation               |
| Loans        | `/loans`                                                                                            | Active loan + schedule, repayment calculator, products, how it works |
| Transactions | `/transactions`                                                                                     | Search, filters, grouped by day, receipt sheet                       |
| Verification | Modal, opened from Home                                                                             | 5 steps: account type, BVN, ID, proof of address, phone              |
| Coming soon  | `/pay-bills`, `/savings`, `/invest`, `/insights`, `/cards`, `/rewards`, `/refer`, `/learn`, `/help` | Placeholder pages, generated from the nav config                     |

**Layout:** phones get a top bar and bottom tabs (Home, Transfer, Loans, Activity, More). At `lg` (1024px) and up, a sidebar replaces the tabs. At `xl` (1280px), Home gets a right-hand column.

---

## Project structure

```
src/
  api/                 Everything that talks to the backend
    client.ts          fetch wrapper: base URL, auth header, errors
    types.ts           Domain types the UI uses
    services/          One file per API area (auth, accounts, transfers…)
    mocks/data.ts      Sample data used while VITE_USE_MOCKS is on
    hooks.ts           React Query hooks + query keys
  app/
    App.tsx, router.tsx, guards.tsx
    providers/         Theme, auth, toast, React Query
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
  styles/              Tailwind entry, design tokens, fonts
```

**Rules of thumb**

- Components never call `fetch`. They use hooks from `@/api/hooks`, which call `@/api/services/*`.
- Put code in the feature that owns it. Move it to `components/ui` or `lib` only once a second feature needs it.
- Import with the `@/` alias, never long `../../` paths.
- No hard-coded colours in components. Use the token classes below.

---

## Design tokens and theming

Tokens are defined in `src/styles/index.css`. Raw values sit in `--rb-*` CSS variables, and `[data-theme='dark']` swaps them. Tailwind reads them through `@theme inline`, so the same class works in both themes. Components almost never need `dark:` variants.

| Class                                                | Use                                                    |
| ---------------------------------------------------- | ------------------------------------------------------ |
| `bg-bg`                                              | Page background                                        |
| `bg-surface` / `bg-surface-2` / `bg-surface-3`       | Cards / fields and subtle fills / tracks               |
| `text-ink` / `text-ink-2` / `text-ink-3`             | Primary / secondary / muted text                       |
| `border-line`                                        | Hairlines and card borders                             |
| `text-brand`                                         | Display headings (navy in light, lilac in dark)        |
| `bg-primary`, `bg-primary-soft`, `text-primary-text` | Signal red actions and states                          |
| `text-success`, `bg-success-soft`                    | Money in, paid, verified                               |
| `text-warning`, `bg-warning-soft`                    | Pending                                                |
| `bg-navy`                                            | Balance card and auth background (same in both themes) |
| `text-tint-airtime/data/bills/card/loans`            | Service icon tints (Figma variables)                   |
| `rounded-field` / `-tile` / `-card` / `-panel`       | 10 / 14 / 20 / 26px radii                              |
| `font-display`                                       | Serif headings and balances                            |

Figma sources: navy `#1B194D`, heading navy `#272570`, red `#C93C38`, body grey `#5A5A5A`, field grey `#F5F5F5`, Inter, Erstoria.

**Theme switching:** `ThemeProvider` saves the user's choice in `localStorage` (`rb.theme`). If there's no saved choice, it follows the device setting. A small script in `index.html` applies the theme before first paint, which prevents a flash of the wrong theme.

### Swapping in Erstoria

The Figma headings use **Erstoria**, a licensed font. Fraunces is a free stand-in until the files arrive. To switch, follow the four steps in `src/styles/fonts.css`. The ₦ sign is always set in Inter (see `Money.tsx`), so the display font doesn't need to include it.

### Logo

`components/ui/Logo.tsx` is a text wordmark for now. Export the official lockup from Figma (node `41:10375`) as SVG into `src/assets/` and swap it in.

---

## Connecting the API

1. Set `VITE_API_BASE_URL` in `.env` and set `VITE_USE_MOCKS=false`.
2. For each file in `src/api/services/`, update the endpoint paths to match the contract. If the response shapes differ from `src/api/types.ts`, map them inside the service. The UI only knows the types in `types.ts`, so components shouldn't need to change.
3. Search the code for `TODO(api)`. Each one marks a decision that depends on the contract:
   - `api/client.ts`: the error message field in error responses
   - `app/providers/AuthProvider.tsx`: token storage (an httpOnly cookie is preferable to localStorage for banking)
   - `api/services/auth.ts`, `api/services/verification.ts`: endpoint paths and the upload format
   - `features/transfer/lib/fees.ts`: use the fee from the API instead of the local NIP table
   - `features/loans/lib/amortization.ts`: use the API's repayment schedule if it provides one
   - `features/auth/CreatePasswordPage.tsx`: match the backend password rules
4. Mutations (transfer, verification steps) already invalidate the relevant queries, so balances and lists refresh after an action.

Amounts are in **naira**. If the API uses kobo, convert in the services layer.

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
- **State:** server data lives in React Query. Local UI state uses `useState`. App-wide concerns (theme, auth, toasts, verification) are React context in `app/providers` or the owning feature.
- **Copy:** sentence case, plain words, and messages that say what happened and what to do next.
- **Accessibility:** icon-only buttons need an `aria-label`. Toggles use `aria-pressed`. Dialogs use `Modal`, which handles Escape and focus.
