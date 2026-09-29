import { useEffect, useState } from "react";

export type EntrySource = "waitlist" | "prolific" | "other";

const SRC_KEY = "itok_src";
const PID_KEY = "itok_pid";
const NOTICE_KEY = "itok_study_notice_seen";

export function normalizeSource(v: unknown): EntrySource {
  return v === "waitlist" || v === "prolific" ? v : "other";
}

export function storeEntry(src: EntrySource, pid?: string) {
  sessionStorage.setItem(SRC_KEY, src);
  if (src === "prolific" && pid) sessionStorage.setItem(PID_KEY, pid.slice(0, 100));
}

export function getPid(): string | null {
  return sessionStorage.getItem(PID_KEY);
}

export function studyNoticeSeen() {
  return sessionStorage.getItem(NOTICE_KEY) === "1";
}
export function markStudyNoticeSeen() {
  sessionStorage.setItem(NOTICE_KEY, "1");
}

/** True when this browser session came in through Prolific. Read after hydration. */
export function useIsStudy() {
  const [study, setStudy] = useState(false);
  useEffect(() => {
    setStudy(sessionStorage.getItem(SRC_KEY) === "prolific");
  }, []);
  return study;
}
