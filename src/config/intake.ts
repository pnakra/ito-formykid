export const CONCERN_OPTIONS = [
  "Something I heard them say",
  "Something I saw them watching or reading",
  "A game or app they've been using",
  "The way they've been acting lately",
  "A word or phrase I didn't recognize",
  "Something a teacher or other parent mentioned",
  "I just have a feeling something is off",
];

export const OBSERVATION_GROUPS = [
  {
    label: "Language & attitudes",
    items: [
      "Comments about women or girls that concern me",
      "Comments about men or boys that seem off",
      "Something that seems unkind toward gay or transgender people",
      "Saying things that sound like they came from somewhere online",
    ],
  },
  {
    label: "Behavior & mood",
    items: [
      "They seem to care a lot about how they look in a way that worries me",
      "They've been pulling away from family or old friends",
      "Skipping meals or talking about food in a way that worries me",
      "Acting like the adults in their life don't understand anything",
    ],
  },
  {
    label: "Social & online",
    items: [
      "A new group of people online I don't know anything about",
      "Something I can't quite put my finger on",
    ],
  },
];

export const AGE_BANDS = ["10-12", "13-14", "15-16", "17-18", "Prefer not to say"];
export const WHERE_OPTIONS = ["Group chat", "Social app", "Game", "In person", "A creator or video", "Not sure"];
export const FREQUENCY_OPTIONS = ["One time", "Recurring", "Not sure"];
export const QUESTION_OPTIONS = [
  "Is my kid being harmed?",
  "Is my kid harming someone else?",
  "Is my kid harming themselves?",
  "Not sure",
];
export const DANGER_OPTIONS = ["Yes", "No", "Not sure"];

export const AGE_OPTIONS = Array.from({ length: 9 }, (_, i) => String(i + 10));

export const AUTOFILL_EXAMPLES = ["looksmaxxing", "Fresh & Fit", "sigma male", "redpill"];

export const DESCRIBE_EXAMPLES = [
  "My 14-year-old keeps repeating a joke from a group chat",
  "Someone forwarded a screenshot of a classmate",
  "My kid follows a creator who gives dating advice",
  "A word I keep hearing in my kid's games",
];

// Fill-in starters on /scan. "___" is the blank the parent completes.
export const STARTERS = [
  "My kid keeps saying ___",
  "Someone in a group chat ___",
  "My kid follows a creator who ___",
  "Someone online asked my kid to ___",
];
export const BLANK = "___";
