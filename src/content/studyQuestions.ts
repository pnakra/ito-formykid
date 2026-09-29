import { SAFETY_COPY } from "@/content/safetyCopy";
import { SCALE, YES_EDITS_NO, YES_NO, type QQ } from "@/components/QuickQuestions";

const FEEL = "How did this result feel?";

export const JOKE_QS: QQ[] = [
  { key: "feel", label: FEEL, type: "choice", options: SCALE, required: true },
  { key: "would_use_words", label: "Would you use the suggested words with a real teen?", type: "choice", options: YES_EDITS_NO, required: true },
  { key: "why", label: "Why, or what would you change?", type: "text" },
];

export const SCREENSHOT_QS: QQ[] = [
  { key: "feel", label: FEEL, type: "choice", options: SCALE, required: true },
  { key: "found_words", label: "Did you find the words to say to your teen?", type: "choice", options: YES_NO, required: true },
  { key: "would_use", label: "Would you use them?", type: "choice", options: YES_EDITS_NO, required: true },
];

export const IMAGE_QS: QQ[] = [
  {
    key: "help_first",
    label: "Where would you go for help with this? Pick the one you'd use first.",
    type: "choice",
    required: true,
    options: [
      ...SAFETY_COPY.sextortion_image.resources.map((r) => ({ value: r.name, label: r.name })),
      { value: "couldnt_find", label: "I couldn't find it" },
    ],
  },
  { key: "felt_off", label: "Did anything on this page feel scary, preachy, or confusing?", type: "choice", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }], required: true },
  { key: "felt_off_what", label: "What felt that way?", type: "text", showIf: (a) => a.felt_off === "yes" },
];

export const LIVE_QS: QQ[] = [
  { key: "cant_tell", label: "According to this result, what can't it tell you about the child?", type: "text", required: true },
  { key: "helped_decide", label: "Did this help you decide what to do next?", type: "choice", options: [{ value: "yes", label: "Yes" }, { value: "somewhat", label: "Somewhat" }, { value: "no", label: "No" }], required: true },
  { key: "missing", label: "What felt missing, unclear, or hard to trust?", type: "text" },
];

export const SAMPLE_QS: Record<string, QQ[]> = { joke: JOKE_QS, screenshot: SCREENSHOT_QS, image: IMAGE_QS };

export const OWN_QS: QQ[] = [
  {
    key: "real", label: "Was this a real situation or one you imagined?", type: "choice", required: true,
    options: [
      { value: "real_now", label: "Real, happening now" },
      { value: "real_past", label: "Real, in the past" },
      { value: "worried", label: "Something I've worried about" },
      { value: "heard", label: "Heard from another parent" },
      { value: "made_up", label: "Made up" },
    ],
  },
  { key: "understood", label: "Did the tool understand your situation?", type: "choice", required: true, options: [{ value: "yes", label: "Yes" }, { value: "partly", label: "Partly" }, { value: "no", label: "No" }] },
  { key: "helped_decide", label: "Did this help you decide what to do next?", type: "choice", required: true, options: [{ value: "yes", label: "Yes" }, { value: "somewhat", label: "Somewhat" }, { value: "no", label: "No" }] },
  { key: "cant_tell", label: "According to this result, what can't it tell you about your child?", type: "text", required: true },
  { key: "missing", label: "What felt missing, unclear, or hard to trust?", type: "text" },
];
