// Identity-protection guard.
//
// A child's own LGBTQ+ identity, questioning, community, or affirming content
// is NEVER a harm. Content teaching a child to hate queer people, or pressuring
// them to suppress their own identity, IS still in scope as a harm.

export const IDENTITY_RESOURCES = [
  { name: "The Trevor Project", number: "1-866-488-7386", tel: "18664887386" },
  { name: "PFLAG", number: "pflag.org", tel: "" },
];

const IDENTITY_PATTERNS: RegExp[] = [
  /\b(came out|coming out)\b/i,
  /\b(gay|lesbian|bisexual|bi|queer|pansexual|asexual|ace)\b/i,
  /\b(trans|transgender|nonbinary|non-binary|genderqueer|genderfluid)\b/i,
  /\b(pronoun|pronouns|they\/them|he\/him|she\/her)\b/i,
  /\b(lgbt|lgbtq|lgbtq\+|lgbtqia)\b/i,
  /\b(questioning (?:their|his|her) (?:gender|sexuality|identity))\b/i,
  /\b(chosen name|new name|dress(?:ing)? differently|presentation)\b/i,
  /\bdrag\b/i,
];

// Signals the input is about ANTI-queer content the child is consuming, or
// pressure to suppress identity — this stays in scope as a harm.
const ANTI_QUEER_PATTERNS: RegExp[] = [
  /\b(anti-?gay|anti-?trans|anti-?lgbt\w*)\b/i,
  /\b(homophobic|transphobic|homophobia|transphobia)\b/i,
  /\b(conversion therapy|pray the gay away|ex-?gay)\b/i,
  /\b(groomers?|degenerates?|abomination)\b/i,
  /\b(hate|hating|hatred|slurs?|disgust\w*)\b[^.]{0,40}\b(gay|queer|trans|lgbt\w*)\b/i,
  /\b(gay|queer|trans|lgbt\w*)\b[^.]{0,40}\b(slurs?|jokes? about|mock\w*|should not exist)\b/i,
  /\b(purity culture|suppress\w*|hide (?:who|what) (?:he|she|they) (?:is|are))\b/i,
];

export function mentionsIdentityExploration(text: string): boolean {
  return IDENTITY_PATTERNS.some((p) => p.test(text));
}

export function mentionsAntiQueerContent(text: string): boolean {
  return ANTI_QUEER_PATTERNS.some((p) => p.test(text));
}

/**
 * True when the input is about the child's own identity exploration and NOT
 * about anti-queer content the child is consuming.
 */
export function isIdentityExplorationOnly(text: string): boolean {
  return mentionsIdentityExploration(text) && !mentionsAntiQueerContent(text);
}

type Result = Record<string, unknown>;

/**
 * Refusal rule, enforced in code and not only in the prompt: the child's own
 * identity can never drive a Concerning / High risk classification.
 */
export function enforceIdentityGuard(result: Result, input: string): Result {
  if (!isIdentityExplorationOnly(input)) return result;

  const label = result.spectrum_label as string | undefined;
  const wasFlagged =
    result.result_type === "identity_affirming" ||
    label === "Concerning" ||
    label === "High risk";

  if (!wasFlagged) return result;

  return {
    ...result,
    result_type: "identity_affirming",
    spectrum_label: null,
    confidence: null,
    identity_note:
      (result.identity_note as string) ||
      "Exploring who they are is a normal part of growing up. It is not a harmful pipeline.",
    separate_concern: (result.separate_concern as string) ?? null,
    parent_guidance: Array.isArray(result.parent_guidance) && result.parent_guidance.length
      ? result.parent_guidance
      : [
          "Your reaction matters more than the label.",
          "Let them lead on names and words.",
          "Keep the door open, even when you are unsure.",
        ],
    opening_question:
      (result.opening_question as string) ||
      "What has felt good about this lately?",
    resources: IDENTITY_RESOURCES,
  };
}

// Words that indicate a real safety situation, independent of identity.
const SAFETY_SIGNALS: RegExp[] = [
  /\b(suicid\w*|kill (?:him|her|them)self|self-?harm|cutting|hurt (?:him|her|them)self|end (?:his|her|their) life)\b/i,
  /\b(starv\w*|purg\w*|throwing up|not eating|skipping meals|restrict\w*)\b/i,
  /\b(abuse\w*|groom\w*|sextortion|nudes|explicit photos|older man|older adult|predator)\b/i,
  /\b(weapon|gun|knife|threat\w*|violence|danger)\b/i,
  /\bgiving away (?:his|her|their) (?:things|stuff|belongings)\b/i,
];

export function hasSafetySignal(text: string): boolean {
  return SAFETY_SIGNALS.some((p) => p.test(text));
}

/** Triage must never escalate on identity exploration alone. */
export function suppressIdentityEscalation(
  category: string | null,
  input: string
): string | null {
  if (!category) return null;
  if (isIdentityExplorationOnly(input) && !hasSafetySignal(input)) return null;
  return category;
}

