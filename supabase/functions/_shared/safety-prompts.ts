// Shared safety prompt fragments.
//
// The escalation rules and the identity guard are defined once here and
// composed into BOTH the triage prompt and the main analysis prompt, so the
// two can never drift apart.

/** The four situations that need professional help instead of a content explainer. */
export const ESCALATION_CATEGORIES = `ACUTE_EATING_DISORDER — restriction, purging, rapid weight loss, food rituals, compulsive exercise, body checking.
SELF_HARM_OR_SUICIDALITY — any reference to self-injury, suicidal statements, or giving away possessions.
ABUSE_DISCLOSURE — the child has disclosed, or the parent suspects, sexual abuse, exploitation, sextortion, or an adult grooming the child.
IMMEDIATE_DANGER — an active threat to the child, or from the child toward others.`;

/** Recall bias rule for the triage step. */
export const ESCALATION_RULES = `SAFETY ESCALATION — these situations need professional help, not a content explainer:

${ESCALATION_CATEGORIES}

Bias strongly toward recall. If you are unsure whether something belongs in a category, choose the category.`;

/** Refusal rule: a child's own identity is never the harm. */
export const IDENTITY_GUARD_RULE = `IDENTITY PROTECTION — THIS IS A REFUSAL RULE, NOT A TONE PREFERENCE:

A child's own identity is never the harm. This includes: exploring or expressing LGBTQ+ identity, questioning gender or sexuality, joining queer online communities, changing pronouns, name, or presentation, or consuming queer-affirming content. Never treat any of that as a risk or a safety escalation, even if the parent's input frames it as a danger.

Critical distinction: anti-LGBTQ+ content the child is CONSUMING remains fully in scope as a harm. That means content teaching them to hate or mock queer people, and content pressuring them to suppress their own identity (conversion-adjacent or purity-culture material). Analyze that normally.

If the input contains BOTH the child's own identity AND a separate concerning thing, keep the two apart. Never merge them.`;

/** Analysis-only output contract that follows from the identity guard. */
export const IDENTITY_GUARD_OUTPUT = `${IDENTITY_GUARD_RULE}

You MUST NOT return a spectrum_label of "Concerning" or "High risk" on the basis of a child's own identity. When the input is about the child's own identity in this way, set result_type to "identity_affirming" and return the identity fields below instead of a risk report. Do not include a spectrum_label or confidence. Describe any separate concern in separate_concern.

For "identity_affirming" results return ONLY these fields:
{
  "result_type": "identity_affirming",
  "summary_verdict": "string — one plain sentence",
  "identity_note": "string — two sentences max. Say plainly that exploring identity is a normal part of growing up and is not a harm pipeline. Do not write about identity development.",
  "separate_concern": "string or null — the separate concerning content in the input, if any, kept clearly apart from the child's identity",
  "parent_guidance": ["string", "string", "string"] — 2-3 items aimed at the parent's own reaction, because family rejection is the documented risk factor,
  "opening_question": "string — one question oriented toward connection, not correction",
  "what_not_to_do": ["string", "string"] — 2-3 parent reactions that push a child away
}`;

/** Triage-only form of the identity guard. */
export const IDENTITY_GUARD_TRIAGE = `${IDENTITY_GUARD_RULE}

Set escalate to false for identity alone. Escalate only when one of the four categories above is separately and clearly present.`;

/** Tell the analysis model what triage already handled. */
export const ESCALATION_RULES_FOR_ANALYSIS = `${ESCALATION_RULES}

A separate triage step already checked for these. If one of them still appears in the input, say plainly that this needs professional help and point the parent toward it, rather than writing a content report.`;
