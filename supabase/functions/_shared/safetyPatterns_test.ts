import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { preCheck } from "./safetyPatterns.ts";

const cases: [string, string | null][] = [
  ["My 14-year-old repeated a demeaning joke about girls", null],
  ["My 16-year-old says someone online wants a private image and told them to keep it secret", "sextortion_image"],
  ["My 13-year-old says a 25-year-old gamer friend sends them gift cards", "adult_contact"],
  ["My kid's friend posted that they don't want to be here anymore", "suicide_self_harm"],
  ["My 12-year-old follows accounts about eating under 500 calories a day", "eating_disorder"],
  ["My daughter said her coach touched her", "abuse_disclosure"],
  ["I found out my son recorded a girl in the locker room", "harmful_sexual_behavior"],
  ["my son said kms after losing a game", "suicide_self_harm"],
  ["My kid keeps saying mewing and looksmaxxing", null],
  ["A grown man keeps texting my daughter", "adult_contact"],
  ["My 16-year-old went to another state with a 25-year-old she met online and I only found out when she called.", "adult_contact"],
  ["My teen went to another state with a 25 y/o she met online", "adult_contact"],
  ["My teen thinks her friend may be in an inappropriate relationship with a teacher.", "adult_contact"],
  ["My daughter's teacher emailed about homework", null],
];

for (const [text, expected] of cases) {
  Deno.test(`preCheck: ${text}`, () => assertEquals(preCheck(text), expected));
}

Deno.test("danger_now Yes wins", () => assertEquals(preCheck("a joke", "Yes"), "immediate_danger"));
