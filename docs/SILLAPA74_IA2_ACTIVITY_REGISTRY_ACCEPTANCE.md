# Sillapa 74 — IA-2 Activity Registry Implementation & Acceptance

> **Stage:** IA-2 · **Status:** CODE IMPLEMENTED IN FEATURE BRANCH; OWNER REVIEW / MOBILE BROWSER ACCEPTANCE PENDING  
> **Branch:** `feat/ia2-activity-registry-v1` · **Target:** `main` after explicit Merge approval  
> **Related:** [Design Lock](SILLAPA74_INFORMATION_ARCHITECTURE_DATA_CONTRACT_DESIGN_LOCK.md) · [Roadmap](SILLAPA74_INFORMATION_ARCHITECTURE_ROADMAP.md) · [IA-1 Acceptance](SILLAPA74_IA1_IMPLEMENTATION_ACCEPTANCE.md)  
> **Prepared:** 15 October 2026

## 1. Objective and source-of-truth boundaries

IA-2 changes the main **รายการแข่งขัน 74** section from a primarily 73↔74 summary comparison into a **searchable, read-only, family → historical child event → grade/type planning registry**. Every item is labeled with its historical source and **draft approval state**, without inventing new official cycle-74 event IDs, approved grade bands, registered teams or stages.

This is **not an official Competition-74 activity list**, registration application or scoring/results system.

The existing Competition 73 results, judges, local school-plan storage and the full 73↔draft-74 comparison remain in place. The historical comparison is reachable inside `<details id="ia2LegacyCompare">`; this is a display/IA change, not a migration or rewrite of competition data.

## 2. Implemented features and file responsibility

| File | Change |
| --- | --- |
| `ia2-registry.js` | Read-only registry builder from `NX.groups` + existing `round70-catalog.js`, per-child grade filtering, Thai search by title/source ID/grade, provenance and safe CSV writer; does not fetch a remote 74 API |
| `ia2.css` | Responsive family/detail cards, source and approval badges, filters, empty states, touch-safe form font sizes, reduced-motion support |
| `index.html` | Add registry **before** the old comparative report; the old report remains under collapsible “ดูการวิเคราะห์เปรียบเทียบ 73 ↔ 74”; mount against the original embedded draft |
| `sw.js` | Update static cache version to `sillapa-public-v4-ia2-20261015`, precache both new assets for installed PWA and offline snapshot |
| `tests/ia2-registry.test.cjs` | Dependency-free Node 22-compatible Local-First contract/UI-simulation checks; **no GitHub Actions test workflow** |
| `README.md` | New feature, data warnings and local command/test procedure |
| This file | Scope, source provenance, acceptance checklist, known limits and next gate |

The actual source counts detected at this stage are **56 draft activity families in 17 groups**, of which:
- **29 families** reference Competition 73 (containing **83 historical level/title variants** drawn from the existing `NX.a` lists).
- **25 families** map by existing exact family title to Competition 70 (containing **63 historical event/grade variants and 63 unique original event IDs**); no grade bands dropped.
- **2 families** are unresolved: **กลุ่มนาฏศิลป์** and **กลุ่ม Soft Power**. Do not infer grade bands, event type or official eligibility.
- A family can contain several child competition events, grade bands and subtypes. Family totals are **not** individual round-74 competition event counts.

## 3. The source contract: historical reference ≠ official 74 approval

### 3.1 Data and labels

- Historical 70 source: `round70-catalog.js`, originally copied from publicly published prior activity list for สพป.ร้อยเอ็ด เขต 3: https://sillapa65.vichakan.net/sp-ret3/?cat=7&file=view_all&name=category
- Historical 73 source: preserved snapshot embedded in `index.html` under the existing `RAW` and draft comparison `NX`.
- Draft 74: existing `NX.groups`; **not** an officially approved publication. `IA2.buildRegistry` labels each draft family `draft74Status:'draft'`.
- `official74ActivityId`, `approvedStage74`, `activityPolicy74`, `representativeQuota74` are **null**. Source-grade labels only describe the competition where the original event existed.
- Synthetic IDs such as `draft-F01-A01` are **temporary UI/source row keys**, not official cycle-74 IDs. Export header explicitly says so.
- A known prior event is not evidence that Competition 74 has authorized the same age band, eligibility, quota, venue, or rulebook.

### 3.2 UI search and filters

- Search Thai activity/family titles, prior child-event name, source ID (e.g. `030`), or grade band.
- Filter independently by **group**, **historical grade**, **source cycle 70 / 73 / unresolved**, **74 approval state**, and **74 competition stage**.
- `confirmed` and stage `district/cluster` must show an **empty “no approved 74 source” explanation**, not invented/zero-official entries. The only populated official state currently is “draft” and unknown stage.
- Where the query matches one child name/ID, the family expands and only matching child references show. When grade is filtered, only that historical grade's child references show. Clear resets all filters; Expand All opens every visible family.
- Download CSV exports **the currently filtered visible child events**, preserving all original source IDs/grades when unfiltered. Export text sanitizes spreadsheet-formula prefixes.

### 3.3 Export schema (15 columns)

1. temporary draft family key (explicitly **not** an official competition code)
2. historical/draft group name
3. draft family title
4. Competition 74 status — `ร่าง — ยังไม่ยืนยัน`
5. official Competition 74 activity ID — **blank**
6. Competition 74 stage — **ยังไม่ประกาศ**
7. Competition 74 admission mode — **ยังไม่ประกาศ**
8. reference source cycle (70/73/unresolved)
9. source competition ID (present for archived 70, intentionally unknown for 73)
10. original child-event name
11. original child grade
12. historical child subtype/name evidence
13. source mapping quality (historical/unresolved)
14. archived source description
15. caveat / required review

On the default unfiltered view, export includes **149 CSV rows total**: 1 header + 63 referenced 70 child rows + 83 referenced 73 child rows + 2 unresolved placeholders. Every row has exactly 15 columns. The 2 placeholders are **not events to register**.

## 4. Evidence from source verification and executable logic checks

The following have been checked against GitHub branch file contents, with a VM evaluation of the real scripts against the real embedded JSON and simulated DOM events:

| Test | Expectation | Result |
| --- | --- | --- |
| IA2-01 | `index.html` inline boot and app JS; `ia2-registry.js`, `sw.js` parse | PASS |
| IA2-02 | Draft count | PASS — 56 families / 17 groups |
| IA2-03 | Historical source crosswalk | PASS — 25 families / 63 distinct 70 IDs, 29 families / 83 73 child titles |
| IA2-04 | Unmapped must remain unresolved | PASS — 2 families |
| IA2-05 | Three grade bands under “คัดลายมือสื่อภาษาไทย” | PASS — historical source IDs 030, 031, 032 |
| IA2-06 | Scout/youth-red-cross family subevents | PASS — 8 separate 70 references |
| IA2-07 | Search by source ID, group/grade/status/stage filters | PASS — 030 returns one family; source 70=25, source 73=29, district/confirmed = no approved records |
| IA2-08 | Simulated UI field changes/expand/reset/empty state | PASS |
| IA2-09 | Filtered CSV and complete CSV shape | PASS — filtered row subset, 149 unfiltered rows, 15 columns |
| IA2-10 | No fabricated 74 approvals/IDs/stages/quotas | PASS — confirmed-only filter empty, export fields empty/unknown |
| IA2-11 | New PWA assets present in versioned shell cache | PASS — `ia2.css`, `ia2-registry.js` |
| IA2-12 | Live iPhone/Android/iPad visual regression + offline/PWA/browser export | **NOT RUN** — needs real-device owner acceptance |

**Reproduce on Windows / VS Code** (Node 22 is recommended, but no external packages or npm install required):

~~~powershell
git fetch origin
git switch feat/ia2-activity-registry-v1
git pull origin feat/ia2-activity-registry-v1
node tests/ia2-registry.test.cjs
python -m http.server 8000
~~~

Open `http://localhost:8000/#next` on the testing computer. Locally serving the site, rather than opening the file directly, is important for script loading and Service Worker behavior.

## 5. Device/browser acceptance before merge

- [ ] iPhone Safari (normal tab and installed PWA): open `#next`; Splash clears, no JS errors; bottom nav remains four buttons.
- [ ] Registry first: 56 draft families; four status boxes show **56 / 25 / 63 / 2**. No unexpected official approval badge.
- [ ] Search `คัดลายมือ`, ID `030`, and `ป.4-ป.6`. Expand card; grade and original source ID are readable, with source URL.
- [ ] `กิจกรรมลูกเสือ เนตรนารี ยุวกาชาด ผู้บำเพ็ญประโยชน์` shows all 8 original source entries in full unfiltered view.
- [ ] `กลุ่มนาฏศิลป์` and `กลุ่ม Soft Power` explicitly show no verified child/grade match, without inventing entries.
- [ ] Apply grade, source, group and search filters together. Filtered card child rows **and CSV** must match; reset/expand controls work.
- [ ] Filter `ยืนยันแล้ว`, or `ระดับกลุ่ม`/`ระดับเขต`: truthful empty state, never zero teams or fake confirmation.
- [ ] Open “ดูการวิเคราะห์เปรียบเทียบ 73 ↔ 74” and switch the original count/impact/groups tabs; existing charts, compare search, old exports and school-plan controls still work.
- [ ] Validate light/dark, iPhone SE, standard iPhone, iPad portrait/landscape and Chrome desktop. No zoom-on-focus, horizontal scrolling, nav overlap or unreachable controls.
- [ ] Test PWA after old cache version v3, then v4; offline shell loads both CSS/JS + round70 catalog, and offline cache snapshot is clearly understood as not live.
- [ ] Existing historical #acts/#judges/#reps/#schools and locally saved school plan remain functional; no new private data leakage.
- [ ] Browser export opens in Excel/Sheets as text, preserves leading-zero source code `030` when configured/imported as text, and handles Thai characters; CSV formula-injection defenses checked. **Note:** Excel may otherwise auto-convert numeric-looking source codes despite the CSV containing `030`; import that column as Text.

## 6. Open constraints and next stage

- The archive's displayed 70 list comes from **a different education service area**; verify with the organizer's definitive event list and official round-74 rulebook before upgrading a draft child entry to `confirmed`.
- The historical 73 source stores competition titles and grades but **does not contain official activity IDs** in this front-end snapshot. Blank 73 source-code cells in CSV are intentional.
- Source-as-of, approval references, canonical IDs, stage policies and change log from official 74 feed do **not** yet exist in this repo. IA-2 only supports the **read-only preparation UI/data model**. Actual approval states and published revision history belong to later authorized data/export gates.
- A public static site's cached snapshot and pull-to-refresh are **not** an API connection. No personal participant, teacher contact or private judge information may be introduced into Pages.

**Suggested next:** IA-3 organizer readiness design/data-source audit after IA-2 device acceptance, or a separate organizer-verified mapping/canonical source gate; do not silently mark historical variants as official active 74 events.

**Merge policy:** Explicit owner approval required; open an isolated PR, run Local-First, merge only after review. A GitHub Pages build succeeding is not a substitute for actual acceptance.
