# NGK-MOBILE-UX-04 — Mobile navigation & content density refinement

**วันที่:** 4 พฤศจิกายน 2569  
**Repository:** `infobwd/sillapa`  
**Base main:** `77d06ef0ba265ea69efeb4f4226f02aa6e15e389`  
**ขอบเขต:** `nongkum.html`, `nongkum-mobile-ux.js`, `nongkum-mobile-ux-04.css`, tests/README/doc only.

## Purpose and safety
The application is a **pre-competition information catalogue**, not a registration, team nomination or competition-result service. Avoid unverified statements that activity counts represent confirmed Round-74 rules or approved entries. Preserve raw rows, historical Round-70/73 descriptions, teacher data separation, PDF/CSV handlers, existing role switchers and desktop layouts.

## Acceptance criteria

1. iPhone/Android mobile home starts with four KPI cards and **no expanded multi-school list**. Clicking an activity KPI shows at most **3** activity summaries (name, grade, count; not eight repeated school tags); clicking the selected KPI again collapses it. Desktop still previews **5**.
2. Each activity KPI drill-down exposes “ดูทั้งหมด N รายการ” when results exceed the preview and opens the existing venue list filtered by all/multi/single, without changing competition records. School-count KPI still lists clickable schools.
3. Back-to-top remains visible only after scrolling on phone/tablet, with accessible `aria-label` and a compact **52px** tap target above the nav. If its lower-right viewport area would overlap a visible primary CTA (insight see-all, export, shortcut, venue action), it hides until the CTA is clear. It remains hidden at top, while typing, in dialogs, and >=1200px. Preserve reduced-motion behavior, safe-area offset and scroll focus.
4. School list puts the school picker/search/results first; lengthy guidance and the after-table explanation are in semantic `details/summary` disclosures with 44px+ targets. No data or confirmation wording is lost.
5. Criteria view searches by activity and level and filters by *historical reference status*: all / matching Round-70 activity and level / review. Show `พบ X จาก Y รายการกิจกรรม` plus the caveat **these are activity counts, not confirmed criteria**. Badges identify matching historical reference, mismatched level or unresolved source; Round-70 links are never labelled as approved Round-74 criteria.
6. Information page keeps purpose, registration/results limitation, status uncertainty and Round-70 historical disclaimer, but shortens prose. Only adjust spacing/typography needed for the affected sections.
7. No changes to original 61-row listing or individual school aliases, exported files, permission boundaries, back navigation, PWA settings or 3D.
8. Light/Dark, 320–430px phone, 768/1024px tablet and 1366/1440/1920px desktop widths remain usable. Verify 200% text scaling and reduced motion.
9. Use Local-First and no GitHub Actions. Merge to `main` only after source-based checks and PR conflict review; do not claim browser acceptance or GitHub Pages deployment without evidence.

## Implementation
- `nongkum.html`: new reference filter and safe status semantics; KPI detail three-row preview on phone, five on desktop; compact school/info disclosures.
- `nongkum-mobile-ux.js`: suppress fixed up button when viewport intersects nearby content CTA; previous scroll, dialog, keyboard, nav measurement, motion and focus paths remain.
- `nongkum-mobile-ux-04.css`: responsive 52px round button, shorter mobile summaries, readable criteria cards and reference filter badges, disclosures, contrast overrides. Status filter is also styled on tablet and desktop.
- `tests/ngk-mobile-ux-04.test.cjs`: reference-status fixtures, visibility collision geometry, source/semantics smoke assertions.
- `tests/ngk-desktop-home-02.test.cjs`: updated the mobile preview regression assertions while retaining the desktop five-row behavior.

## Verification carried out
- **23/23 checks passed** from four real branch test scripts evaluated using a controlled JavaScript V8 test harness with in-memory Node API mocks. This includes 5 checks in the new test, 7 from NGK-MOBILE-UX-03, 5 from desktop-home-02 and 6 from desktop-ux-01.
- Parsed inline scripts from the modified HTML using `new Function` without syntax failures.
- This is **not** local Node CLI execution, real-browser interaction, measured device rendering, exported PDF/CSV output or production smoke testing.

## Local-First verification still required
```sh
node --test tests/ngk-mobile-ux-04.test.cjs tests/ngk-mobile-ux-03.test.cjs tests/ngk-desktop-home-02.test.cjs tests/ngk-desktop-ux.test.cjs
```
Manual: on iPhone Safari/PWA and Android Chrome, open Home/Items/Criteria/Info and inspect scroll positions in the four supplied screenshot states. Confirm KPI drill-down and correct filters, near-CTA hiding, back-to-top focus, touch targets, dynamic type and OS dark mode, school picker/search and criteria filter, browser Back/Forward, print/PDF/CSV. Repeat at desktop widths to catch unintended style regressions.

## Concurrency and status
At task start, PR #122 touched teacher-verification documents and PR #70 touched 3D venue files; neither overlaps the target paths. Recheck before merging. A GitHub merge is not proof GitHub Pages deployed or passed device acceptance, and is not approval for production database changes.
