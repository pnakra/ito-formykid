import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  enforceIdentityGuard,
  isIdentityExplorationOnly,
  suppressIdentityEscalation,
} from "./identity-guard.ts";

// Identity exploration — must never be treated as a risk.
const IDENTITY_INPUTS = [
  "My son came out as gay last week and I don't know what to say.",
  "She asked us to use they/them pronouns now.",
  "He joined a queer Discord server and is on it every night.",
  "My daughter says she might be bisexual and is questioning her sexuality.",
  "He's started dressing differently and picked a chosen name.",
  "She watches a lot of trans creators on TikTok.",
];

// Anti-queer content the child is consuming — stays in scope as a harm.
const ANTI_QUEER_INPUTS = [
  "He keeps repeating homophobic jokes he heard on YouTube.",
  "My son watches videos saying trans people are groomers.",
  "Her youth group is pushing conversion therapy on her.",
  "He follows a creator who says gay people should not exist.",
];

Deno.test("identity exploration is detected", () => {
  for (const input of IDENTITY_INPUTS) {
    assertEquals(isIdentityExplorationOnly(input), true, input);
  }
});

Deno.test("anti-queer content is not treated as identity exploration", () => {
  for (const input of ANTI_QUEER_INPUTS) {
    assertEquals(isIdentityExplorationOnly(input), false, input);
  }
});

Deno.test("Concerning / High risk is refused for identity exploration", () => {
  for (const input of IDENTITY_INPUTS) {
    for (const label of ["Concerning", "High risk"]) {
      const guarded = enforceIdentityGuard(
        { result_type: "normal", spectrum_label: label, confidence: "High" },
        input,
      );
      assertEquals(guarded.result_type, "identity_affirming", input);
      assertEquals(guarded.spectrum_label, null);
      assertEquals(guarded.confidence, null);
      assertEquals(Array.isArray(guarded.resources), true);
    }
  }
});

Deno.test("anti-queer content keeps its risk classification", () => {
  for (const input of ANTI_QUEER_INPUTS) {
    const guarded = enforceIdentityGuard(
      { result_type: "normal", spectrum_label: "Concerning", confidence: "High" },
      input,
    );
    assertEquals(guarded.result_type, "normal", input);
    assertEquals(guarded.spectrum_label, "Concerning", input);
  }
});

Deno.test("benign identity results are left alone", () => {
  const guarded = enforceIdentityGuard(
    { result_type: "normal", spectrum_label: "Mainstream", confidence: "High" },
    IDENTITY_INPUTS[0],
  );
  assertEquals(guarded.result_type, "normal");
  assertEquals(guarded.spectrum_label, "Mainstream");
});

Deno.test("triage never escalates on identity alone", () => {
  for (const input of IDENTITY_INPUTS) {
    assertEquals(suppressIdentityEscalation("ABUSE_DISCLOSURE", input), null, input);
  }
});

Deno.test("triage still escalates when a real safety signal is present", () => {
  assertEquals(
    suppressIdentityEscalation(
      "SELF_HARM_OR_SUICIDALITY",
      "My son came out as gay and now he's talking about suicide.",
    ),
    "SELF_HARM_OR_SUICIDALITY",
  );
  assertEquals(
    suppressIdentityEscalation(
      "ABUSE_DISCLOSURE",
      "She uses they/them now and an older man online asked her for nudes.",
    ),
    "ABUSE_DISCLOSURE",
  );
});
