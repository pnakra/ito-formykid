# Project architecture

- Keep the homepage as an explanatory introduction and direct its try actions to /scan; the lookup form lives on /scan so the first page can establish the three-question approach before input.

- Keep the interactive practice coach in a TanStack server function, not a new Edge Function, because internal app calls run on the supported server boundary.
- Reuse the scan IP rate-limit database function for practice calls so both features share the same quota without storing text.
- Keep study mockups as static React components and render those components into PNGs so images match the study screen.- Study variants live in src/lib/entrySource.ts (prolific=1, prolific2=2); study steps (notice, consent, screener) are enforced by StudyTasks before any task page, so answers can't be skipped by fast clicks.
- Dinner-question subscribers are insert-only from the browser; reads and unsubscribes go through server functions with the admin client, so the list is never readable by visitors.
- Keep standard lookup reports as a short numbered reading path with optional deeper detail; parents should see the meaning and next action before supplementary context.
- Keep intake details on the optional pre-report specificity step, passing selected and free-text context to analysis; the report itself stays read-only so parents get one answer after one submission.
