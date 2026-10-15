# IA-4 — School Preparation Workspace · Local-First Design, Security & Acceptance

> **Repository:** infobwd/sillapa · **Branch:** `feat/ia4-school-preparation-workspace` → `main`  
> **Baseline:** IA-3 merged via PR #8, `93071ea3514b95bc77966a9518cc61edf2dec506` (verified 15 October 2026)  
> **Status:** IMPLEMENTED IN FEATURE BRANCH / OWNER LOCAL & DEVICE ACCEPTANCE PENDING / **NOT MERGED**  
> **Authority:** `docs/SILLAPA74_INFORMATION_ARCHITECTURE_DATA_CONTRACT_DESIGN_LOCK.md`, `docs/SILLAPA74_INFORMATION_ARCHITECTURE_ROADMAP.md` P4, `infobwd/repo-governance` LOCAL_FIRST.

## A. Source audit and actual baseline

The public site is a static GitHub Pages PWA. Its `#prep` view already contains historical 73 school/medal benchmarks, the proposed 74 draft family list with historical 70 variants, a school picker, a browser plan, grade-band chips, a plan copy/export function, and a visible calendar template. None is a verified 74 entry or official eligibility policy.

The former `plan74` stored **one global `{school,items}` object**, so selecting a second school reused the first school's activity list. The original code also contained an optional undocumented `window.claude.use('db')` `plans` collection sync, unavailable in normal GitHub Pages and **not an approved Competition Manager source**. IA-4 disables the optional sync and stops writing the legacy `plan74` key. This is intentional; previous cross-device sync is NOT claimed.

No canonical 74 `school_id`, approved auth/deep link, team entry, official verification status or source-approved public activity eligibility is present in Sillapa. Do not join by display labels or suggest the school selector validates user authority. Historic school display names are **local selectors**; the canonical linkage requires a separately approved school-ID mapping and a gated core integration.

## B. Scope delivered

1. Add the **แผนในเครื่องนี้ · ไม่ใช่ใบสมัคร** overview panel with three transparent values: activity selections in this device's chosen school, number with preparation checklist completed, and completed checklist steps. These are **local actions only**; never show an official 'registered' status.
2. Continue using current school selector, 73 benchmarks, 70/73 level references, category browsing, school shortlist, local copy/CSV/HTML exports, mobile four-button navigation and More bottom sheet. Keep `#prep`, `#next`, `#groups` and other historical anchors.
3. Store each school's activities/grades/checklists separately using `sillapa74:school-workspace:v1`. Changing the selected school loads **its own plan**; newly selected schools begin empty.
4. Migrate the previous `plan74` to the new school profile **once**, without changing or deleting `plan74`. If the old record has activities without an assigned school, quarantine as unassigned; only import on explicit button press **after school selection**. Imported unassigned items never replace newer matching items.
5. Add three teacher-owned preparation checks per selected activity: check announced criteria, review grade/team planning, prepare documents required by official notice. Checkmarks persist locally; checking them does **not** submit or certify a team.
6. Show old planning dates with qualifiers: **4 Dec 2569** is the cluster representative submission deadline to district, **not** an all-activity application deadline; **21–24 Dec 2569** is a tentative area competition window.
7. Replace misleading 'แข่งต่อได้ในครั้งที่ 74' with 'กิจกรรมเดิมที่ยังอยู่ในร่างครั้งที่ 74'; preserve 70 grade child entries without implying officially approved 74 grades.
8. Device save failure is visible (rather than a silent cloud-sync message). The old unapproved optional cloud `plans` connection is removed. The district-wide provisional plan totals remain **— / ยังไม่มีข้อมูลยืนยัน**, rather than invented 0.
9. Precache the new public static files `ia4-workspace.js` and `ia4.css` in `sillapa-public-v6-ia4-20261015`; no new dependencies, GitHub Actions workflow, API or database write.
10. Update local plan copy text to include preparation step progress and a plain warning that it is not registration confirmation.

## C. Information and data protection

- Only `school` display label + selected **draft** activity titles, grade-band choices and checklist booleans are saved. Do not add actual student/teacher/team rosters, photos, contacts, credentials or private data.
- Local device storage is **not multi-user access control**: another person using the same browser profile may view local plans. Clear the local browser profile or use separate browser accounts on shared devices. This is not an authenticated school account system.
- No live 74 registration API, official `school_id`, role-protected deep link or database mutation is added. The core `AcademicCompetitionManager` remains source of truth; any linkage is a **separate Owner + privacy + permission gate**.
- `plan74` remains read-only and unmodified for rollback. New v1 data is local only. Deleting browser site data will remove unsynced new school plans; use existing copy/export before clearing cache/storage.
- No automatic 'submit', 'verified', 'quota used', 'ready for district', representative count or fabricated approval score is derived from a local checklist.
- No change to Competition 73 Production, results, roster, judge data or backend.
- The same school display name may not be a durable official ID; collision/mapping risk is documented and is a blocker for central reporting.
- The public site cannot guarantee retention across devices or private modes. If storage unavailable, show a warning, do not claim successful saving.

## D. Local-First tests (run on **exact** PR head)

In VS Code PowerShell, on a clean worktree:

```powershell
git fetch origin
git switch --detach origin/feat/ia4-school-preparation-workspace
git rev-parse HEAD
git status --short
node --check ia4-workspace.js
node --check tests/ia4-school-workspace.test.cjs
node tests/ia4-school-workspace.test.cjs
node tests/ia3-readiness.test.cjs
node tests/ia2-registry.test.cjs
git diff --check origin/main...HEAD
python -m http.server 8000
```

Open `http://localhost:8000/#prep`. On phone, use the **same Wi-Fi** and `python -m http.server 8000 --bind 0.0.0.0`; open `http://<COMPUTER_LAN_IP>:8000/#prep` from iPhone Safari. Local-network HTTP does not exercise service-worker install/offline fully (secure context required). For those, test approved HTTPS Pages **after separate Merge/production approval**, or a separately approved HTTPS test environment.

### Functional test matrix

| Test | Expected |
|---|---|
| Legacy `plan74` has school + choices | First load imports into new store; legacy storage unchanged; no dropped chosen grade |
| Legacy plan without school | Quarantined; warning + explicit adopt after school selection, preserves existing choices |
| Select School A, choose activities + checks, switch to B | B shows its own empty plan; no A items/checks or count |
| Select B activity and grades, return to A | A's exact choices/checks remain after reload |
| Remove an activity | Only that school's item and checks removed; other school unaffected |
| Tab 'รายกลุ่มสาระ' add item without school | Opens school selector first, does not write unassigned cross-school plan |
| Copy plan | Includes activity/grade, checklist progress and 'not an official application' |
| Offline/static/PWA | IA-4 assets included in Service Worker shell; cached offline after approved HTTPS install |
| Full/blocked storage | Visible save failure; no misleading success; corrupt v1 state not overwritten |
| Disconnected district view | — / unknown, never 0 when there is no published source |
| iPhone 375–430 / iPad / Desktop | 4-button mobile nav, More sheet, checklist thumb targets, safe area, no clipping |
| Existing `#next` IA-2 + `#readiness` IA-3 | Functional and unchanged; IA-2/IA-3 suite passes |
| Dark/Light, reduced motion, installed PWA pull refresh | Existing features still usable |
| Browser reload and storage | Selections/checks persist on same device; no cross-device promise |

### Evidence accurately separated

- **In-tool V8 replay:** PASS for all three repository test scripts (IA-2 registry/mount/CSV, IA-3 publication/KPI, IA-4 school isolation/migration/checklist), plus parsing of the inline page scripts. This is **not a real Node process**.
- **Owner exact-HEAD Node and `git diff --check`: NOT RUN**; above commands must be run in VS Code and recorded with OS / Node version and exact commit SHA.
- **Device/UI/PWA acceptance:** NOT RUN. A successful JS parser does not prove browser/iPhone/iPad interactions.
- **Actions:** NOT REQUIRED for new test workflow under LOCAL_FIRST; not CI PASS.
- **Production and public Pages:** NOT APPROVED / NOT DEPLOYED from this unmerged feature PR.

## E. Owner release gate and next

1. Verify exact commit, run Node/IA2/IA3/IA4 suites, test plan migration with a copy of existing browser data (don't delete original), test A→B→A and orphan adoption, screenshots of mobile/iPad/desktop.
2. Review change to previously optional cloud plan sync. Current GitHub Pages does **not** have an authorized shared plan system; keep central aggregation disconnected until separate public data/source decision.
3. Record review and **explicitly authorize Merge**. Merge to `main` can trigger GitHub Pages deployment and therefore is a separate production decision.
4. Test Pages revision/cache rollover and iPhone installed PWA only after GO. Rollback: revert PR; legacy `plan74` was not modified, new local v1 store stays in browser for recovery. Do not clear site data for rollback.
5. **Next possible PR:** IA-5 judge/venue planning UI, or separate authenticated core school-ID/public-aggregate contract if central reporting is approved. No new API/PII/public submissions in this IA-4 PR.
