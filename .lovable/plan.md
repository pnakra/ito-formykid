# App audit report (read-only, nothing changed)

## 1. Routes
| Route | Renders |
|---|---|
| `/early-access` | **The waitlist / early access page.** Countdown to Oct 1, email + role checkboxes, crisis note with 988 and Take It Down links, thank-you screen with copy-link. Public. |
| `/unlock` | Team password box (public, noindex). Sets a 30-day cookie that opens the rest of the site. |
| `/` | Product landing page: textarea + example chips, example report, "What this isn't", footer. |
| `/why` | "Why this exists" page with parent-concern stats. |
| `/scan` | One-screen input: "Something happened" (default) / "Look something up", chips, optional age. |
| `/results` | Calls scan-content, renders the report, escalation screen, or identity screen; refinement panel below. |
| `/home` | Signed-in dashboard: Understand now / Stay ahead, monthly briefing, situation notes, protective factors. |
| `/history`, `/account` | Signed-in scan history, notes, digest settings. |
| `/login`, `/signup` | Email + password auth. |
| `/lovable/email/transactional/preview` | Internal email template preview. |

Every route except `/early-access`, `/unlock`, and `/lovable/*` redirects to `/early-access` unless the password cookie is set (`src/lib/accessGate.ts`, wired in `__root.tsx`).

## 2. Pricing, checkout, upgrade, counters
- `src/config/billing.ts`: `is_free_tier_unlimited = true`, `FREE_LOOKUP_LIMIT = 3`. **Neither is imported anywhere** — the flag is a label, not a switch; gating was removed from the pages directly.
- No upgrade prompts or pricing copy remain in any route.
- Leftover payment code: `src/lib/stripe.ts` (unused client), edge functions `create-checkout`, `create-portal-session`, `payments-webhook`, table `subscriptions`, and `profiles.is_subscribed` / `stripe_customer_id`.
- Counter: `profiles.scan_count` is still bumped from the browser in `results.tsx` and read in `home.tsx` (only to pick the default tab). `localStorage itook_first_scan_done` also set. No limits enforced.
- Env/secrets: Stripe client token env in `stripe.ts`; no Stripe secret is in the secret list, so checkout would fail if called.

## 3. Edge functions
**scan-content** (called by `/results`, no login required)
- Receives `{content, inputType, intake, userId}` from the browser.
- Call 1: triage prompt + content to `google/gemini-2.5-flash-lite`. If flagged (acute eating disorder, self-harm, abuse disclosure, immediate danger), returns an escalation object and saves the scan (`escalated=true`).
- Call 2: full system prompt + detailed message (content, age, gender, concerns, signals; lookup vs description mode) to `google/gemini-2.5-flash`, function-call JSON. Identity guard overrides; missing fields backfilled.
- Returns the report JSON. Writes one row to `scans` with the service role: raw `input_content`, summary, guidance, spectrum, confidence, age, concern areas, status.

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
- **Logs:** scan-content logs `AI response structure` (first 1,000 chars of the model reply, which can echo the concern) when parsing fails, and logs full error objects. No log prints the input directly.
- **Browser:** concern text sits in `sessionStorage` (`scanIntake`); history/home show only extracted terms. No console.log of it. No third-party error reporter installed.

## 6. Waitlist and login
- **Waitlist:** form → `joinWaitlist` server function → zod check → upsert by email (duplicates silently ignored) → alert email to priya@overridelabsprevention.org once per new row. No email to the signer; confirmation is visual only (green check + "Your email is saved.").
- **Login:** email + password only (`signInWithPassword`, `signUp` with email confirmation). No Google sign-in, no password reset page. All behind the password gate, so real visitors can't reach it.

## 7. Uploads
None. No file inputs, no storage buckets, no image handling anywhere.

## 8. Visual theme
**The early access theme is now the product-wide theme** (changed this session). Everything lives in `src/styles.css`:

- **Colors** (`:root`, all oklch): background `oklch(0.19 0.03 165)` deep ink green; card `oklch(0.24 0.035 165)`; accent surface `oklch(0.32 0.06 165)`; primary fresh green `oklch(0.78 0.19 155)` with dark ink `oklch(0.19 0.05 165)` text on it; foreground `oklch(0.97 0.01 150)`; muted text `oklch(0.78 0.02 155)`; hint `oklch(0.68 0.02 155)`; border/input `oklch(0.34 0.04 165)`; ring = primary.
- **Fonts:** Space Grotesk 500/700 for all headings (letter-spacing -0.02em), DM Sans 400/500/700 for body. Loaded via `<link>` in `__root.tsx`. Inter and Source Serif 4 removed entirely.
- **Type scale:** 18px base body, line-height 1.6; headings 26–56px; helper text 13–15px in hint color.
- **Radius:** `--radius: 1rem`; shared buttons/inputs use rounded-xl; marketing cards rounded-2xl/3xl; pills rounded-full.
- **Buttons/inputs:** primary = solid green bg + ink text; outline = border + transparent bg; ghost = hover accent. Inputs = card bg, border, green focus ring.
- **Background treatments:** flat dark ink, no shadows, no glows, no gradients. Severity uses text weight, never color (risk-* tokens are all the same card tint).
- **Icons:** lucide-react, small, in green-tinted circles (`bg-primary/15 text-primary`).
- **Other pages:** none differ anymore — the old light "earthy" palette is deleted and every route inherits the same tokens. `/early-access` no longer needs its `.theme-launch` wrapper class.

## Broken or risky
1. **scan-content trusts `userId` from the request body.** Anyone can save scans under another user's ID. Should read the user from the login token.
2. **scan-content has no rate limit and no login** — anyone can run up AI costs by calling it directly (the site password gate protects the UI, not the function).
3. **`is_free_tier_unlimited` does nothing** — misleading if someone flips it expecting gating to return.
4. **Dead payment code** still deployed (`create-checkout` accepts any `userId` in metadata; `payments-webhook` has JWT checks off). Should be removed or locked.
5. **Users can edit their own `is_subscribed`** via the profiles update policy.
6. **Model reply logged on parse failure** can contain sensitive concern details.
7. **Anonymous scans store raw text forever** with no retention or deletion path — tension with the privacy-first promise on the waitlist page.
8. **Password gate `unlocked` flag** is a module-level in-memory variable; fine client-side today, fragile if reused server-side.
9. Models are Gemini 2.5; newer defaults exist but nothing is broken.
10. `/signup` footnote still says "Your first lookups are free" — leftover pricing hint.
11. Error text on login/signup uses the risk-high token, which on the dark theme is light text, not red — readable but no longer visually an error color.

## Suggested next step (if you want fixes)
Priority order: fix #1 and #2 in scan-content, then remove payment leftovers (#3–#5), trim the log (#6), decide a retention rule for anonymous scans (#7). Approving this only acknowledges the report; tell me which fixes to make.
