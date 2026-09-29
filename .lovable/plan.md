# App audit report (read-only, nothing changed)

## 1. Routes
| Route | Renders |
|---|---|
| `/early-access` | **The waitlist page.** Dark green theme, countdown, email + role checkboxes, crisis note, thank-you screen. Public. |
| `/unlock` | Team password box (public, noindex). Sets a 30-day cookie. |
| `/` | Old product landing page: textarea + chips, example report, "What this isn't". |
| `/why` | "Why this exists" page with parent stats. |
| `/scan` | One-screen input (Something happened / Look something up). |
| `/results` | Calls scan-content, shows report, escalation screen, or identity screen, plus refinement panel. |
| `/home` | Signed-in dashboard: Understand now / Stay ahead, monthly briefing, notes, protective factors. |
| `/history`, `/account` | Signed-in scan history, notes, digest settings. |
| `/login`, `/signup` | Email + password auth. |
| `/lovable/email/transactional/preview` | Internal email template preview. |

Every route except `/early-access`, `/unlock`, and `/lovable/*` redirects to `/early-access` unless the password cookie is set (`src/lib/accessGate.ts`, wired in `__root.tsx`).

## 2. Pricing, checkout, upgrade, counters
- `src/config/billing.ts`: `is_free_tier_unlimited = true`, `FREE_LOOKUP_LIMIT = 3`. **Neither is imported anywhere** — the flag is a label, not a switch. Gating was removed from the pages directly.
- No upgrade prompts or pricing copy remain in any route.
- Leftover payment code: `src/lib/stripe.ts` (unused client), edge functions `create-checkout`, `create-portal-session`, `payments-webhook`, table `subscriptions`, and `profiles.is_subscribed` / `stripe_customer_id`.
- Counter: `profiles.scan_count` is still bumped from the browser in `results.tsx` and read in `home.tsx` (only to pick the default tab). `localStorage itook_first_scan_done` is also set. No limits enforced.
- Env/secrets involved: Stripe client token env in `stripe.ts`; no Stripe secret is in the secret list, so checkout would fail if called.

## 3. Edge functions
**scan-content** (called by `/results`, no login required)
- Receives `{content, inputType, intake, userId}` from the browser.
- Call 1: triage prompt + content to `google/gemini-2.5-flash-lite`. If flagged, returns an escalation object and saves the scan (`escalated=true`).
- Call 2: full system prompt + detailed message (content, age, gender, concerns, signals) to `google/gemini-2.5-flash`, function-call JSON. Identity guard overrides; missing fields backfilled.
- Returns the report JSON. Writes one row to `scans` with the service role: raw `input_content`, summary, guidance, spectrum, confidence, age, concern areas, etc.

**home-ai** (signed-in only, verifies token)
- `monthly_briefing` → `gemini-2.5-pro` with the age group; returns bullets + protective note.
- `pattern_summary` → `gemini-2.5-flash` with the parent's own dated notes (full text); returns 2–3 sentences.
- `protective_suggestions` → `gemini-2.5-flash` with factor names; returns suggestions.
- Writes nothing itself (the browser caches briefings into `monthly_briefing_cache`).

## 4. Tables and row security
| Table | Stores | RLS |
|---|---|---|
| `profiles` | email, scan_count, is_subscribed, stripe id, digest settings | On, own-row. Users can UPDATE their own `is_subscribed` — harmless now, risky if payments return. |
| `scans` | raw concern text + report | On, own-row. Anonymous rows (user_id null) are invisible to everyone but the service role — correct. |
| `scan_notes` | notes on scans | On, own-row, full CRUD. |
| `situation_log` | dated behavior notes | On, own-row, no update. |
| `protective_factors` | 5 self-ratings | On, own-row. |
| `monthly_briefing_cache` | cached briefings | On, own-row. |
| `subscriptions` | Stripe subscription | On, service role writes, own-row read. |
| `waitlist_signups` | email, roles, UTM, referrer, user agent | On, no policies → only server code reads/writes. Correct. |

## 5. Raw concern text exposure
- **Tables:** yes — `scans.input_content` for every scan, including anonymous ones (by design, per your earlier request). Notes tables hold parent-written text.
- **Logs:** scan-content logs `AI response structure` (first 1,000 chars of the model reply, which echoes/paraphrases the concern) when parsing fails, and logs full error objects. No log prints the input directly.
- **Browser:** concern text sits in `sessionStorage` (`scanIntake`) and in URLs on history/home only as extracted terms. No console.log of it. No third-party error reporter is installed.

## 6. Waitlist and login
- **Waitlist:** form → `joinWaitlist` server function → zod check → upsert by email (duplicates silently ignored) → alert email to priya@overridelabsprevention.org once per new row. No email to the signer.
- **Login:** email + password only (`signInWithPassword`, `signUp` with email confirmation). No Google sign-in, no password reset page. All of this sits behind the password gate, so real visitors can't reach it.

## 7. Uploads
None. No file inputs, no storage buckets, no image handling.

## 8. Theming
- All tokens in `src/styles.css`: `@theme inline` maps tokens; `:root` holds the calm light palette, radius 0.625rem, 18px base, Inter + Source Serif 4.
- `.theme-launch` block overrides colors (dark ink green), radius 1rem, and fonts (Space Grotesk headings, DM Sans body). **Only `/early-access` uses it** — the rest of the app looks completely different.
- Fonts load via a Google Fonts link in `__root.tsx`. Spacing is Tailwind utilities per page, no shared scale beyond defaults.
- Note: project memory says "Inter, earthy palette, no shadows" — the waitlist page intentionally breaks that.

## Broken or risky
1. **scan-content trusts `userId` from the request body.** Anyone can save scans under another user's ID. Should read the user from the login token.
2. **scan-content has no rate limit and no login** — anyone can run up AI costs by calling it directly (mitigated only by the site password gate on the UI, not the function).
3. **`is_free_tier_unlimited` does nothing** — misleading if someone flips it expecting gating to return.
4. **Dead payment code** still deployed (`create-checkout` accepts any `userId` in metadata; `payments-webhook` has JWT checks off). Should be removed or locked.
5. **Users can edit their own `is_subscribed`** via the profiles update policy.
6. **Model reply logged on parse failure** can contain sensitive concern details.
7. **Anonymous scans store raw text forever** with no retention or deletion path — clash with the privacy-first promise on the waitlist page.
8. **Password gate `unlocked` flag** is an in-memory variable; fine in the browser, but it's module-level on the server too (only set client-side, so OK today — fragile).
9. Models are Gemini 2.5; newer defaults exist but nothing is broken.
10. `/signup` footnote still says "Your first lookups are free" — leftover pricing hint.

## Suggested next step (if you want fixes)
Priority order: fix #1 and #2 in scan-content, then remove payment leftovers (#3–#5), trim the log (#6), and decide a retention rule for anonymous scans (#7). Approving this only acknowledges the report; tell me which fixes to make.
