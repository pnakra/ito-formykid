import { useEffect, useState } from "react";

export type EntrySource = "waitlist" | "prolific" | "prolific2" | "other";
export type StudyVariant = 1 | 2;

const SRC_KEY = "itok_src";
const PID_KEY = "itok_pid";
const NOTICE_KEY = "itok_study_notice_seen";
const CONSENT_KEY = "itok_consent";
const SCREENER_KEY = "itok_screener_done";

export function normalizeSource(v: unknown): EntrySource {
  return v === "waitlist" || v === "prolific" || v === "prolific2" ? v : "other";
}

export function isStudySource(s: unknown) {
  return s === "prolific" || s === "prolific2";
}

export function storeEntry(src: EntrySource, pid?: string) {
  const prev = sessionStorage.getItem(SRC_KEY);
  // Study 1 is closed: send new study-1 arrivals to study 2. Anyone already
  // mid-study-1 in this browser (prev === "prolific") keeps their flow.
  if (src === "prolific" && prev !== "prolific") src = "prolific2";
  // A new study link starts that study's steps fresh.
  if (isStudySource(src) && prev !== src) {
    [NOTICE_KEY, CONSENT_KEY, SCREENER_KEY, "itok_study_tasks"].forEach((k) => sessionStorage.removeItem(k));
  }
  sessionStorage.setItem(SRC_KEY, src);
  if (isStudySource(src) && pid) sessionStorage.setItem(PID_KEY, pid.slice(0, 100));
}

export function getPid(): string | null {
  return sessionStorage.getItem(PID_KEY);
}

/** 1 = first Prolific study, 2 = own-situation study, null = not in a study. Browser only. */
export function studyVariant(): StudyVariant | null {
  if (typeof window === "undefined") return null;
  const s = sessionStorage.getItem(SRC_KEY);
  return s === "prolific" ? 1 : s === "prolific2" ? 2 : null;
}

export function studyNoticeSeen() {
  return sessionStorage.getItem(NOTICE_KEY) === "1";
}
export function markStudyNoticeSeen() {
  sessionStorage.setItem(NOTICE_KEY, "1");
}

export function getConsent(): "yes" | "no" | null {
  const v = sessionStorage.getItem(CONSENT_KEY);
  return v === "yes" || v === "no" ? v : null;
}
export function setConsent(v: "yes" | "no") {
  sessionStorage.setItem(CONSENT_KEY, v);
}
export function screenerDone() {
  return sessionStorage.getItem(SCREENER_KEY) === "1";
}
export function markScreenerDone() {
  sessionStorage.setItem(SCREENER_KEY, "1");
}

/** True when this browser session came in through either Prolific study. Read after hydration. */
export function useIsStudy() {
  return useStudyVariant() !== null;
}

export function useStudyVariant() {
  const [v, setV] = useState<StudyVariant | null>(null);
  useEffect(() => {
    setV(studyVariant());
  }, []);
  return v;
}
