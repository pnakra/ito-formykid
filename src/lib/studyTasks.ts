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

// Called from track(): ticks tasks from existing events.
export function tickFromEvent(event: string, props: Record<string, unknown>) {
  if (event === "sample_opened") {
    const id = props.sample_id;
    if (id === "joke" || id === "screenshot" || id === "image") tickTask(id);
  }
  if (event === "result_viewed" && props.is_sample === false) tickTask("live");
}
