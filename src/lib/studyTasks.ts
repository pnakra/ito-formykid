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

export const TASK_ORDER: { key: TaskKey; to: "/samples/$id" | "/scan"; id?: string; next: string }[] = [
  { key: "joke", to: "/samples/$id", id: "joke", next: "" },
  { key: "screenshot", to: "/samples/$id", id: "screenshot", next: "Next: screenshot sample" },
  { key: "image", to: "/samples/$id", id: "image", next: "Next: image sample" },
  { key: "live", to: "/scan", next: "Next: try it yourself" },
];

export function nextTask() {
  const t = getTasks();
  const n = TASK_ORDER.find((x) => !t[x.key]);
  return n ?? null;
}
