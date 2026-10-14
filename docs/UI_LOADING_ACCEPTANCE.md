# UI Loading Acceptance — Mobile Zoom, Splash, Skeleton

**Status:** Implementation PR / LOCAL_FIRST (ยังไม่ Merge และยังไม่ได้ตรวจผ่าน Browser จริง)
**Scope:** `infobwd/sillapa/index.html` only, no API/DB writes

## Behavior contracts

1. **Phone (iOS/Android):** viewport requests `maximum-scale=1,user-scalable=no`, CSS `touch-action` allows vertical/horizontal scroll but suppresses built-in content pinch zoom where browser honors this setting; input fields >= 16 px to avoid iOS focus zoom. Native OS accessibility zoom remains under user/browser control. Do not disable desktop zoom.
2. **Splash:** branded splash displayed before the embedded data render; fade out only after all eight views are ready. Minimum visible duration ~400 ms (disabled for reduced-motion preference). A 7-second independent watchdog exposes a *reload* button instead of a stuck spinner when initialization fails.
3. **Skeletons:** structural placeholders and `aria-busy` exist for all eight views: overview, reps, groups, schools, acts, judges, next, prep. They are removed from display once embedded data is rendered; switching ready tabs remains immediate with no simulated delay. Future asynchronous data adapters may invoke `window.__sillapaSetLoading(view, true/false)`.
4. **Safeguards:** keep existing content, filters, historical scoring data, calendar, participant/planning flows and exports unchanged. No new dependency or build chain.
5. **Accessibility:** skeletons have `aria-hidden`; startup splash uses a live status and a large reload control on failure; obey `prefers-reduced-motion`. Zoom restriction intentionally carries an accessibility tradeoff; revisit if stakeholders require WCAG text magnification.

## Acceptance checklist — local VS Code

- [ ] Open `index.html` via a local HTTP server on desktop; splash appears, then main view appears without blank screen or infinite overlay.
- [ ] iPhone Safari and Chrome Android: try pinch zoom and double-tap; page stays within requested scale where the browser permits; vertically scroll, tap navigation, open bottom sheet, and enter search text.
- [ ] iPhone: focusing `input/select` must not unexpectedly auto-zoom; on iPad/tablet, confirm layout remains usable.
- [ ] Visit all 8 tabs: real content replaces placeholder and filtering, charts, search, school selection and CSV/HTML exports still work.
- [ ] Test a deliberately induced JS failure: after 7 seconds, splash presents an actionable reload button (remove failure injection after test).
- [ ] With OS/browser reduced motion enabled, shimmer/slide animation stops and splash completes.
- [ ] Repeat on light/dark mode, portrait/landscape and narrow desktop.
- [ ] GitHub Pages post-merge: verify latest `main` commit deployed and browser hard refresh (do not assume merge automatically publishes).

## Test evidence already checked by assistant

- GitHub branch `feat/mobile-splash-skeleton-v1`: checked 2 inline scripts via V8 JavaScript parse — PASS.
- Static DOM invariants: eight view sections, eight skeleton containers, a single branded splash, zoom viewport and 7-second watchdog — PASS.
- Startup simulation: section `aria-busy` clears, watchdog timer cancels on completion, splash fades and removes — PASS.
- **Browser interaction / visual acceptance: NOT RUN**; complete the checklist before approving merge in accordance with Local-First governance.

Rollback: revert the PR merge; no database or competition record changes.
