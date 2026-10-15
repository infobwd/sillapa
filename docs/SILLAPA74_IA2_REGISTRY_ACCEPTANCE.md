# Sillapa 74 — IA-2 Activity Registry Implementation & Acceptance

> **Stage:** IA-2, implementation in feature branch; owner/device acceptance and Merge PENDING  
> **Repository:** `infobwd/sillapa` · Branch: `feat/ia2-activity-registry-v1`  
> **Date:** 15 October 2026 · **Status:** REVIEW REQUESTED, NOT MERGED/DEPLOYED  
> **Design source:** [IA Data Contract Design Lock](SILLAPA74_INFORMATION_ARCHITECTURE_DATA_CONTRACT_DESIGN_LOCK.md) and [IA Roadmap](SILLAPA74_INFORMATION_ARCHITECTURE_ROADMAP.md)

## 1. Purpose

Make the **รายการแข่งขัน 74** section a searchable **planning registry** that distinguishes:
- *Draft competition-74 activity family*: in original `NX.groups`; not a confirmed official activity, grade, registration stage or eligibility rule.
- *Historic child-level source records*: from round 70 `round70-catalog.js` or archived round 73 activity titles in `NX.groups[].i[].a`.
- *Unknown/unmatched*: family titles without a verified historic child-level reference.
- *Approved 74 activity*: **NOT CONNECTED**. Never infer official 74 IDs, stage, quotas or criteria from historic sources.

The historical 73↔74 comparison remains available in a collapsible section immediately below the new registry. The existing `#next` deep link still opens this section and all 11 IA-1 views remain.

## 2. Confirmed SOURCE baseline in this repository

| Metric | Count | Definition |
| --- | ---: | --- |
| Draft 74 activity families | **56** | `NX.groups[].i[]`, 17 category groups |
| Families with historic 70 source | **25** | Titles matched in `round70-catalog.js`, where no 73 activity match is supplied |
| Individual round-70 references | **63** | Every named child event/grade, with **63 unique round-70 source IDs** |
| Families referenced to 73 source | **29** | Existing `activity.a[]` entries as the supplied 73 reference |
| Individual round-73 title references | **83** | All `activity.a[]` activity titles, grade extracted from title when stated |
| Families pending mapping | **2** | `กลุ่มนาฏศิลป์`, `กลุ่ม Soft Power`: no confirmed exact source match; no fabricated grades |
| Exported CSV (unfiltered) | **148 body rows + 1 header** | 63 from 70 + 83 from 73 + 2 unmatched |

The 70 reference file explicitly identifies its source as **สพป.ร้อยเอ็ด เขต 3**: https://sillapa65.vichakan.net/sp-ret3/?cat=7&file=view_all&name=category . It is a reference catalog in a separate area's archive, **not** the 74 official rules of สพป.กาญจนบุรี เขต 4. Mapping by draft family name is **not individual-event-level approval**, and a source ID from 70 is never treated as an official 74 ID.

Source-73 activity titles are based on the pre-existing `NX` and associated snapshot. The published data here contain no official individual 73 ID for those references; do not invent one. The label “รหัสอ้างอิงรายการในร่าง (ชั่วคราว)” used by this UI/CSV is **not** a canonical ID or durable `activity_id`.

## 3. UI and filters

- Search by Thai family title, subtype, child event title, grade or historic source code.
- Filter by **category** (17 groups), **historical grade band**, **source era (70/73/pending)**, **approval status (draft/confirmed)**, and **74 stage scope (unknown/cluster/district)**. The confirmed and known-stage options intentionally show no records until an authorized 74 source becomes available; the empty state explains the limitation.
- Each collapsed family card shows draft title, category, source-era badge, count of historic child records and grade chips. Expand to inspect **every historic child/subtype** with exact title, grade and known source ID. The whole list defaults to collapsed for performance on phones; “ขยายรายการย่อยทั้งหมด” provides a fast review.
- Grade or child-code search shows only child rows matching that filter when expanded, not every grade on every filtered card.
- The registry is labeled **ร่าง** everywhere. The historic comparison is still accessible by expanding “ดูการวิเคราะห์เปรียบเทียบครั้งที่ 73 ↔ ร่างครั้งที่ 74”.
- Source panel links to the 70 archive and to local round-73 activity data. The UI does not advertise it as an approved 74 registration/rulebook page.

## 4. Download contract (CSV only, no Backend)

The Export button downloads **filtered records** with UTF-8 BOM. Each row is an individual historic child event, or an explicit unmatched family placeholder. Include 15 columns for provisional draft-family key, draft group/title, proposed 74 status, blank official 74 activity ID, unannounced stage/policy, source era, source activity ID (if supplied), exact historical title/grade and mapping/source warning.

- Filtering by `70` outputs 63 child records when all grades are selected. Filtering by grade outputs only matching child records; unmatched families have no invented grade.
- 74 official event ID columns remain **blank**, not synthetic aliases. Historic source IDs belong to the source cycle only.
- Prevent opening formula-like cell values as active spreadsheets by prefixing suspicious text in CSV. No names/PII from student, teacher, judge/team rows are exported.
- Export of existing school planning/73 comparison CSV remains unchanged; this IA-2 CSV is an **additional**, explicitly reference-only download.

## 5. Static and local acceptance matrix

| ID | Verification | Expected |
| --- | --- | --- |
| IA2-01 | JavaScript source parse and service-worker parse | PASS without introducing a new build or GitHub Actions workflow |
| IA2-02 | Source diff | `RAW`, `NX`, results, judges and existing 73 exports unchanged |
| IA2-03 | Source reconciliation | 56 families, 25/63 70 source, 29/83 73 source, 2 unresolved, no duplicate 70 IDs |
| IA2-04 | Search `030` / `คัดลายมือ` | Correct draft family; `030` shows only the correct grade child |
| IA2-05 | Filter 70 + `ป.1-ป.3` | Display matched source child rows only; download uses identical grade filter |
| IA2-06 | Filter confirmed stage district/cluster | Empty state with explanation, not fabricated official approval or level |
| IA2-07 | Inspect `กวีเยาวชนคนรุ่นใหม่` and `กิจกรรมลูกเสือ...` | Preserve distinct source subtypes and all eight scout/Red Cross entries |
| IA2-08 | Inspect unmatched families | Two “รอตรวจสอบ” states, no grade/official event ID invented |
| IA2-09 | Unfiltered CSV and source IDs | Exactly 148 body rows, 15 columns, 63 unique 70 source IDs; 74 official IDs blank |
| IA2-10 | Original comparison disclosure | All three comparison tabs, groups/search, 73 evidence and links still work |
| IA2-11 | Mobile/iPad and desktop | Controls readable, native details keyboard-accessible, safe-area nav unaffected, no overflow; dark/light |
| IA2-12 | PWA installed/offline | `ia2.css` and `ia2-registry.js` precached in SW v4, online refresh loads latest public snapshot, old snapshot labeled as historical |
| IA2-13 | School planning and archive | Existing local school plan (`plan74`), 70/73 views and original CSV exports unaffected |
| IA2-14 | Security/scope | No API/backend writes, no personal data added, source URLs are external https with safe link attributes |

**Assistant static/simulated tests:** evaluated JS source, reconciled all 56 draft groups / 146 sourced child records, confirmed all 63 historical 70 source IDs unique, 2 unresolved, and 148 CSV data rows. Simulated filter/search/render states (including unmatched source, blank 74 IDs, grade-only export and 0 approved 74 records). These are **code-level evidence only**.

**Owner browser testing (NOT RUN):** iPhone Safari/PWA, Android Chrome, iPad portrait/landscape, desktop, dark mode, offline refresh, downloadable CSV opened in Excel, production navigation and performance. Follow LOCAL_FIRST with exact commit and screenshot/console evidence.

## 6. Local-first VS Code test

~~~powershell
git fetch origin
git switch feat/ia2-activity-registry-v1
git pull origin feat/ia2-activity-registry-v1
python -m http.server 8000
~~~

Open http://localhost:8000/#next (HTTP localhost is suitable for local PWA tests on that machine). On another mobile device use HTTPS preview or test after owner-approved Merge and a successful Pages deployment. No build step needed for this static repository.

## 7. Rollback, release and next stage

- **No Merge** or Production release in this PR without separate owner instruction. Service Worker version `sillapa-public-v4-ia2-20261015` prevents a previously installed PWA from indefinitely reusing old scripts after a proper deployed release.
- Rollback requires reverting the PR and publishing a **new service-worker cache version** if users have already installed/activated IA-2.
- Future IA-3 or later authoritative 74 feeds must have separate security approval, schema validation, actual `cycle_id/activity_id/stage_scope` and published status; IA-2 is **not** that feed. The future official catalog must be able to supersede the draft without silently reclassifying historical child rows.
- The true 74 register requires checking the approved activity announcement, child-level mapping and stage policies with the organizer; historical 70 and 73 sources alone are insufficient.
