// Feature switches. Code stays in place; flip a flag to bring a feature back.

// "Stay ahead" tab on /home (monthly briefing, pattern summary, protective factors).
export const STAY_AHEAD_ENABLED = false;

// Risk spectrum (Mainstream / Edgy but benign / Concerning / High risk) on /results.
export const SHOW_RISK_SPECTRUM = false;

// Public launch. While false, the site password gate is on
// (except /start?src=prolific). Flip to true on Oct 1 to open to everyone.
export const LAUNCH_OPEN = true;

// Shown to Prolific participants after they finish /study/done.
export const PROLIFIC_COMPLETION_CODE = "CZE6F6V0";

// Shown after the second (own-situation) study, src=prolific2.
export const PROLIFIC2_COMPLETION_CODE = "CZE6F6V0";

// "Get a monthly email" button on results. Off until the digest is live.
export const DIGEST_SIGNUP_ENABLED = false;

// Weekly dinner-table question card on /start and /home, plus email signup.
export const DINNER_PROMPT_ENABLED = true;
