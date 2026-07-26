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

export const GENDER_OPTIONS = ["Boy", "Girl", "Nonbinary", "Prefer not to say"];

export const AGE_OPTIONS = Array.from({ length: 8 }, (_, i) => String(i + 11));

export const AUTOFILL_EXAMPLES = ["looksmaxxing", "Fresh & Fit", "sigma male", "redpill"];

export const DESCRIBE_EXAMPLES = [
  "He started referring to girls as 'females'",
  "She stopped eating and started following fitness accounts",
  "He said he didn't need to listen to his female teacher",
  "His whole attitude toward women changed",
];
