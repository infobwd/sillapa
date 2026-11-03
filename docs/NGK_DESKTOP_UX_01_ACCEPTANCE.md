# NGK-DESKTOP-UX-01 — Desktop school/venue usability

## Scope and source of truth
- Repository: `infobwd/sillapa`, base `main`.
- Target: `nongkum.html` on large desktop screens, with a separately scoped `nongkum-desktop.css`.
- Purpose: pre-competition information for schools and venue planners. This is **not** registration, staff nomination, or competition results.
- Changes are presentation-only except for the responsive disclosure of the existing “other participating schools” list.
- No changes to source rows, historical Round 70/73 references, competition rules, teacher registry, or private files.

## Acceptance criteria
1. Desktop **>=1200px**: header text is readable; the four existing navigation destinations appear in a top bar, with no duplicate navigation.
2. Desktop school role: filter/select/export panel appears on the left; competition records on the right; no horizontal page scroll at 1366px, 1440px, or 1920px with typical browser scaling.
3. A school row shows its sequence, activity, level, source/criteria link, other-school count, and status. Other-school names are collapsed behind a keyboard-operable `details/summary` disclosure.
4. A school change or activity search must still filter existing rows. Print/PDF, CSV, and teacher-checklist actions must keep using the existing handlers and source data.
5. Desktop venue role: category, status filtering, activity cards, and export actions remain functional; cards use two columns when space permits.
6. Tablet **768–1199px** and mobile **<768px** retain their prior bottom navigation and existing school-card layouts. Other-school names stay directly visible on these widths.
7. Crossing the 1200px breakpoint re-renders the disclosure layout; no duplicate school chips or stale selection.
8. Thai content and light/dark schemes retain readable contrast and visible keyboard focus. Historical Round-70 links remain clearly labelled as references rather than certified Round-74 rules.
9. Do not change JS data arrays or public/private data boundaries. Preserve the printed output, including its original full team/school list.
10. Readme/acceptance record distinguishes static checks from real-browser acceptance. Do not claim iPhone/iPad/Android/desktop visual QA without evidence.

## Implementation
- `nongkum-desktop.css`: width-scoped desktop header/navigation, expanded content, sticky filters, compact scan-friendly school rows, wider venue cards, theme adjustments.
- `nongkum.html`: loads this CSS; renders school-chip disclosures using native `details` **only** at desktop widths. Re-renders when the breakpoint changes.
- `tests/ngk-desktop-ux.test.cjs`: offline structural/regression smoke checks. Test is intentionally static and does not replace browser acceptance.

## Local-First verification
Run from repository root:
```sh
node --test tests/ngk-desktop-ux.test.cjs
```
Then manually open `nongkum.html` in a browser at 1366, 1440, 1920, 1024, 768, 390, and 375 CSS px. Validate school selection/search, school disclosure, venue filters, export print/PDF/CSV, keyboard/Tab/Escape as applicable, browser Back, light/dark mode, and PWA caching if installed.

## Evidence and limitations
- A connector-level source check is possible without a locally mounted copy. Static presence/structure tests alone are not a browser screenshot or actual interaction test.
- Desktop/iOS/Android manual browser acceptance is **not confirmed** by this document.
- `nongkum.html` and `nongkum-desktop.css` are public presentation assets; no private teacher details are included.
- The unrelated open Three.js traffic PR #70 changes `venues/schematic-3d.html`, a test, and its acceptance doc; none is modified by this task.
