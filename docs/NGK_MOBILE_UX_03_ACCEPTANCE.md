# NGK-MOBILE-UX-03 — Mobile light-mode readability and safe “ขึ้นบน” button

**Date:** 4 November 2026  
**Repository:** `infobwd/sillapa`, based on `main` commit `e014966391bbf295be72827c39a73efceef1df6b`  
**Work scope:** presentation and navigation helper for `nongkum.html` only. No competition row, historical source, teacher registry, registration, or results-data changes.

## Acceptance criteria agreed before merge

1. On phone widths up to 767px, key supporting text becomes readable (generally ~14–16px; section titles ~21–24px), with natural Thai line wrapping. Keep the main `h1` prominent and its current structure.
2. The pale-blue “เลือกดูข้อมูลสำหรับโรงเรียนหรือผู้จัดสนามแข่งขัน” line becomes dark blue-grey `#49647e` on `#f3f6fa`, approximate WCAG contrast 5.69:1. Dark mode retains a high-contrast light colour.
3. The two role-choice cards remain full-width and easy to tap; typography enlarges without truncation, especially on 320–390px screens.
4. Mobile bottom-navigation labels grow slightly, but the same four destinations and selection behavior remain. Existing Desktop (>=1200px) layout from PR #123/#124 must be unchanged.
5. On widths below 1200px, a floating `ขึ้นบน` button appears only after scrolling down more than max(480px, 75% of viewport height). It must be hidden at page top, on desktops, while typing into a field, when a dialog is open, or while an on-screen keyboard significantly reduces the visual viewport.
6. The button stays **above** the existing bottom navigation, using the actual measured nav height and iOS right safe-area inset; minimum 48px tap target, visible focus, and accessible Thai label.
7. Clicking the button scrolls the same document to top without navigating or changing school, competition filters, selected role, or exported data. Honor `prefers-reduced-motion` with an instant scroll.
8. Preserve original function handlers: school and venue selection, CSV/PDF/print, older competition links, pull-to-refresh, splash screen, four navigation buttons, and printable views.
9. Work must remain Local-First without GitHub Actions, and a PR should not claim Browser Acceptance or deployment solely from code/static tests.

## Implementation

- `nongkum-mobile-ux.css`: scoped readability changes for phone sizes, safe-area-aware floating button styles up to tablet width, separate light/dark theme colors and accessible focus. A high-specificity header subtitle override keeps text readable despite legacy inline mobile CSS.
- `nongkum-mobile-ux.js`: visibility based on window scroll position; measured nav height using `getBoundingClientRect` and optional `ResizeObserver`, passive listeners with `requestAnimationFrame` scheduling, guards for keyboard/dialog; focus returns to the header after scrolling.
- `nongkum.html`: loads two external assets and adds one initially hidden semantic button.
- `tests/ngk-mobile-ux-03.test.cjs`: seven assertions/tests for structural preservation, CSS scope/contrast hints, scroll threshold, nav measurement, keyboard/modal suppression, reduced motion, and desktop query.

## Evidence and verification

- 7/7 test callbacks **passed in a controlled V8 harness**, using branch-source strings and mocks of Node built-ins. This is not a local Node CLI test or a Safari/Chrome browser interaction test.
- Existing public 8-school competition listing and School/Print CSV IDs remain in the unchanged HTML portion.
- Real layout/contrast, page-scroll physics, touch interaction, text resizing, iOS PWA safe areas and screenshot review remain **not verified** until manual QA.

## Local-first manual checks after merge

```bash
node --test tests/ngk-mobile-ux-03.test.cjs tests/ngk-desktop-home-02.test.cjs tests/ngk-desktop-ux.test.cjs
```

Test using iPhone Safari and Home Screen PWA at CSS widths ~375/390/430px, Android Chrome at 360/412px, iPad 768/1024px, Desktop 1366/1440/1920px. Check Light/Dark, large-text settings, “ขึ้นบน” appearance after scroll, hide near top/keyboard/dialog, scroll return, correct location above bottom nav with safe-area, all four nav tabs, school selection, CSV/PDF and print. Check on-page `#list` and `#criteria` states as well as home.

## Parallel work check

At task start, open PR #122 only modified teacher verification documentation; open PR #70 modified Three.js venue files/tests/docs. Neither touched `nongkum.html` or these two new mobile assets. Always recheck before merge.

## Rollout boundary

Merge to GitHub `main` is not proof GitHub Pages has deployed, passed real-device acceptance, or changed production data. No production database actions are part of this task.
