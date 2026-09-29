// Reviewed help blocks, one per safety category. Single source of truth for
// resources shown on results and on /help. The AI never writes these.

export type SafetyCategory =
  | "immediate_danger"
  | "suicide_self_harm"
  | "sextortion_image"
  | "adult_contact"
  | "abuse_disclosure"
  | "harmful_sexual_behavior"
  | "eating_disorder";

export interface HelpResource {
  name: string;
  what: string;
  phone?: { label: string; tel: string };
  url?: { label: string; href: string };
}

export interface SafetyBlock {
  title: string;
  guidance: string[];
  resources: HelpResource[];
}

export const RESOURCES = {
  emergency: {
    name: "911",
    what: "If someone is in immediate danger.",
    phone: { label: "Call 911", tel: "911" },
  },
  lifeline988: {
    name: "988 Suicide and Crisis Lifeline",
    what: "Call or text 988, any time.",
    phone: { label: "Call or text 988", tel: "988" },
  },
  cybertip: {
    name: "NCMEC CyberTipline",
    what: "Report online sexual exploitation of a child.",
    phone: { label: "1-800-843-5678", tel: "18008435678" },
    url: { label: "report.cybertip.org", href: "https://report.cybertip.org" },
  },
  takeItDown: {
    name: "Take It Down",
    what: "Help removing nude or sexual images of someone under 18.",
    url: { label: "takeitdown.ncmec.org", href: "https://takeitdown.ncmec.org/" },
  },
  childhelp: {
    name: "Childhelp",
    what: "Child abuse hotline.",
    phone: { label: "1-800-422-4453", tel: "18004224453" },
  },
  rainn: {
    name: "RAINN",
    what: "Sexual assault hotline.",
    phone: { label: "1-800-656-4673", tel: "18006564673" },
  },
  stopItNow: {
    name: "Stop It Now",
    what: "Confidential help if you're worried about a child's or adult's sexual behavior.",
    phone: { label: "1-888-773-8368", tel: "18887738368" },
    url: { label: "stopitnow.org/help", href: "https://stopitnow.org/help" },
  },
  anad: {
    name: "ANAD eating disorders helpline",
    what: "Support and referrals. Not a crisis line.",
    phone: { label: "1-888-375-7767", tel: "18883757767" },
    url: {
      label: "anad.org",
      href: "https://anad.org/get-support/eating-disorders-helpline/",
    },
  },
} satisfies Record<string, HelpResource>;

/** Order used on the /help page. */
export const HELP_PAGE_RESOURCES: HelpResource[] = [
  RESOURCES.emergency,
  RESOURCES.lifeline988,
  RESOURCES.cybertip,
  RESOURCES.takeItDown,
  RESOURCES.childhelp,
  RESOURCES.rainn,
  RESOURCES.stopItNow,
  RESOURCES.anad,
];

export const SAFETY_COPY: Record<SafetyCategory, SafetyBlock> = {
  immediate_danger: {
    title: "Someone may be in danger now",
    guidance: [
      "If anyone could be hurt right now, call 911.",
      "Stay with your kid if you can, and keep them away from the danger.",
      "The rest of this can wait until everyone is safe.",
    ],
    resources: [RESOURCES.emergency],
  },
  suicide_self_harm: {
    title: "Get support for this today",
    guidance: [
      "Call or text 988 to talk with a trained counselor, for you or for them.",
      "Stay close, stay calm, and ask them directly if they are thinking about hurting themselves. Asking does not put the idea in their head.",
      "If they are in danger right now, call 911.",
    ],
    resources: [RESOURCES.lifeline988, RESOURCES.emergency],
  },
  sextortion_image: {
    title: "This may involve a private image",
    guidance: [
      "Do not delete the messages, do not pay, and do not download or forward the image.",
      "Stay calm and tell your kid they are not in trouble. The person pressuring them is the one doing wrong.",
      "You can report it and ask for help getting images taken down.",
    ],
    resources: [RESOURCES.cybertip, RESOURCES.takeItDown],
  },
  adult_contact: {
    title: "An adult may be contacting your kid",
    guidance: [
      "Do not confront the adult or delete messages before you report.",
      "Save what you can, like usernames and screenshots, and tell your kid they are not in trouble.",
      "You can report it and talk it through with a trained counselor.",
    ],
    resources: [RESOURCES.cybertip, RESOURCES.childhelp],
  },
  abuse_disclosure: {
    title: "Your kid may have told you something hard",
    guidance: [
      "Believe them, and thank them for telling you.",
      "Don't press for details. Let them share what they want, and tell them it is not their fault.",
      "A trained counselor can help you with next steps.",
    ],
    resources: [RESOURCES.rainn, RESOURCES.childhelp],
  },
  harmful_sexual_behavior: {
    title: "Your kid may have harmed someone",
    guidance: [
      "Make sure any sharing stops now, including deleting copies your kid has.",
      "Stay calm. Your kid needs clear limits and support, not shame.",
      "Get confidential guidance before you decide next steps.",
    ],
    resources: [RESOURCES.stopItNow],
  },
  eating_disorder: {
    title: "This may be about eating",
    guidance: [
      "Talk with your kid's doctor soon, and share what you have noticed.",
      "Try not to comment on their weight or body. Focus on how they are feeling.",
      "If there is a medical emergency, call 911.",
    ],
    resources: [RESOURCES.anad, RESOURCES.emergency],
  },
};

export function isSafetyCategory(v: unknown): v is SafetyCategory {
  return typeof v === "string" && v in SAFETY_COPY;
}
