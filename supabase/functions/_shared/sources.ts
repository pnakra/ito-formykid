// Copy of src/content/sources.ts for edge functions. Keep both in sync.
export interface Source {
  id: string;
  title: string;
  url: string;
  description: string;
}

export const SOURCES: Source[] = [
  {
    id: "cdc_stop_sv",
    title: "STOP SV: A Technical Package to Prevent Sexual Violence",
    url: "https://stacks.cdc.gov/view/cdc/39126",
    description: "CDC strategies to prevent sexual violence, including teaching healthy relationship skills and bystander approaches.",
  },
  {
    id: "cdc_precollege",
    title: "Precollege Sexual Violence Perpetration: Risk and Protective Factors",
    url: "https://stacks.cdc.gov/view/cdc/52634/cdc_52634_DS1.pdf",
    description: "CDC review of risk and protective factors for sexual violence perpetration by young people before college.",
  },
  {
    id: "ncmec_sextortion",
    title: "Sextortion (NCMEC)",
    url: "https://www.missingkids.org/theissues/sextortion",
    description: "What sextortion is, how it targets young people, and how families can respond.",
  },
  {
    id: "take_it_down",
    title: "Take It Down (NCMEC)",
    url: "https://takeitdown.ncmec.org/",
    description: "Free service to help remove nude or sexual images of someone taken when they were under 18.",
  },
  {
    id: "take_it_down_faq",
    title: "Take It Down FAQ",
    url: "https://takeitdown.ncmec.org/faq/",
    description: "Common questions about how Take It Down works and what it can and cannot do.",
  },
  {
    id: "fbi_sextortion",
    title: "Sextortion (FBI)",
    url: "https://www.fbi.gov/how-we-can-help-you/common-frauds-and-scams/sextortion",
    description: "FBI guidance on sextortion schemes targeting minors and how to report them.",
  },
  {
    id: "stop_it_now",
    title: "Stop It Now: Get Help",
    url: "https://stopitnow.org/help",
    description: "Confidential help for adults worried about a child's or another person's sexual behavior toward others.",
  },
  {
    id: "anad_helpline",
    title: "ANAD Eating Disorders Helpline",
    url: "https://anad.org/get-support/eating-disorders-helpline/",
    description: "Peer support and referrals for eating disorder concerns. Not a crisis line.",
  },
];

export const SOURCE_IDS = new Set(SOURCES.map((s) => s.id));
