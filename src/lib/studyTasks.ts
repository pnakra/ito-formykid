export type TaskKey = "joke" | "screenshot" | "image" | "live";
const KEY = "itok_study_tasks";
export const TASKS_EVENT = "itok-tasks";

export function getTasks(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function tickTask(k: TaskKey) {
  if (typeof window === "undefined") return;
  const t = getTasks();
  if (t[k]) return;
  t[k] = true;
  sessionStorage.setItem(KEY, JSON.stringify(t));
  window.dispatchEvent(new Event(TASKS_EVENT));
}

// Tasks tick only when that page's Quick questions card is submitted.
export function tickFromEvent(_event: string, _props: Record<string, unknown>) {}
