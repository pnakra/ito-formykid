# Project architecture

- Keep the interactive practice coach in a TanStack server function, not a new Edge Function, because internal app calls run on the supported server boundary.
- Reuse the scan IP rate-limit database function for practice calls so both features share the same quota without storing text.
- Keep study mockups as static React components and render those components into PNGs so images match the study screen.