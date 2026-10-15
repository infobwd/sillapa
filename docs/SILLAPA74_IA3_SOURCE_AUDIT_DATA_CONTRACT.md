# IA-3A — Organizer Readiness Source Audit & Public Projection Contract

**Repository:** `infobwd/sillapa` · **Cycle:** 74 · **Audit date:** 15 October 2026  
**Status:** UI-ready / source publication **NOT APPROVED** · No backend/API/DB changes  
**Sillapa baseline:** `main` at `e42501492693a605ff2906450940549d7b788a8d` (PR #7 merged).  
**Referenced policy:** `infobwd/repo-governance` Design Lock v1.0 and `LOCAL_FIRST` (no new test Actions).

## 1. Findings from source verification

| Location | Confirmed from code/docs | Public IA-3 treatment |
|---|---|---|
| `infobwd/sillapa` `main` | Static GitHub Pages-style HTML/PWA; IA-1 navigation, IA-2 draft 70/73 registry, offline/pull-refresh; historical 73 data, local plans | Keep history and local plans unchanged. Not an official 74 registration source |
| `infobwd/AcademicCompetitionManager` `main` | `43b24da3f65c05be33c0d8400af15ee57f949e2e`; NOT the same as active `stabilize/73-prod` | Never read "main" as evidence of a deployed 74 publication |
| `AcademicCompetitionManager` `stabilize/73-prod` | Stage entry, representative promotion (`#45`), role-scoped aggregate reads (`#107`), filtered entry lists (`#106`), with permissions and acceptance gates | Server-side authenticated data. **Do not** treat a 73 role-scoped API as a public 74 export |
| `AcademicCompetitionManager` PR #108 | MERGED; owner chose separate 74 DB + application base. Decision is architecture only | No inference that 74 DB or publication is provisioned |
| `AcademicCompetitionManager` PR #109 | MERGED into 73 stabilization branch; browser identity/PWA isolation source with separate deployment acceptance | Not a public data access grant |
| `AcademicCompetitionManager` PR #110 | OPEN as audited: guarded isolated-74 catalog creation code, no approved DB/host migration or public readiness export | **Block live integration**. New backend proposal must be separately reviewed |
| `repo-governance` | LOCAL_FIRST requires exact-commit local proof, code review and separate production approval; protect personal data | This PR writes **only** static UI, JS contract and documentation |

**Audit conclusion:** No approved public Competition 74 readiness snapshot, publication identifier, source timestamp, authoritative complete denominator or personal-data release authorization was found. Even a technically accessible 73 endpoint cannot be used by the public site. GitHub Pages publish/build status could not be read through available endpoint; the current branch is **not** the deployed site.

## 2. Authoritative ownership and boundaries

- **Competition Manager owns:** registrations, entries, roster, verification, representative selection, per-event quotas, policy versions, roles and official approvals.
- **Sillapa owns:** explanatory planning UI and **read-only, approved and sanitized** public projections only. No login, API credentials, direct DB/API calls, exports of student/teacher/judge identities or duplicate registration tables.
- **Legacy 70/73** cannot be an input for a confirmed 74 KPI. Draft activity families/grade references are not approved 74 district events.
- Deadline **4 Dec 2026** is for sending representative information to district, not a universal registration-close date. **21–24 Dec 2026** is only a tentative district window.

## 3. Proposed `sillapa-readiness-v1` projection (future gate only)

Runtime adapter: `window.SILLAPA_IA3.mount({rootId:'ia3Root',snapshot:null})`. **The shipped call deliberately passes null.** The module does not fetch a network endpoint or cache a private dataset. There is currently **no JSON dataset committed**.

A future approved immutable public snapshot can be supplied explicitly only after separate Owner/source/privacy sign-off. Required envelope:

| Field | Requirement |
|---|---|
| `schema_version` / `cycle_id` | Exactly `sillapa-readiness-v1` / `74` |
| `publication_id` / `publication_state` / `data_version` | Unique release reference, `published`, nonempty version |
| `source_system` / `source_reference` / `source_as_of` / `published_at` | Canonical `AcademicCompetitionManager`, reference and valid timezone-bearing timestamps |
| `coverage` | Four explicit `complete` / `partial` flags: `catalog`, `obligations`, `teams`, `issues` |
| `activity_catalog` | Confirmed district child activity ID, family ID, category/title, stage `district`, approved mode, source and timestamp |
| `clusters` | Public canonical cluster IDs + approved labels, no personal contact/roster |
| `public_readiness_aggregates` | Unique record and cluster–activity IDs, district scope, `obligation_state`, independent planning/submission/review states, nullable verified qualified team count and source time |
| `public_issues` | Sanitized public issue ID, related activity/optional group, approved short title, `open`/`resolved` and reference |

Only the documented allowlisted fields are accepted. Unexpected fields (including person-level roster data), duplicate IDs/pairs, unknown referenced IDs, wrong cycle/stage, incomplete publication metadata, missing timestamps, invalid team count or incompatible policy reject **the entire snapshot**.

**Distinct state axes:** `planning_state: not_started | drafting | null`; `submission_state: not_started | drafting | submitted | null`; `verification_state: not_reviewed | pending | needs_revision | verified | locked | null`. These are **not** automatically promoted into each other. Actual submission/status mapping must be approved in the main repo before generating a public snapshot. The UI renders them separately.

**Policy modes:** `representative_only`, `open`, `representative_plus_open`, `closed`. Only expressly listed `required` cluster–activity obligations count; `open` and `closed` **cannot create cluster representative obligations**. Do not assume one representative per cluster; `qualified_teams` is a verified **non-negative integer** and may exceed 1. Approval reference and actual quotas remain source-governed.

## 4. KPI definitions and unknowns

The first six cards are **global, unfiltered, source-complete figures only**. Applying filters drills down into records but intentionally displays **—** on full-scope KPI cards; this prevents an incorrectly complete denominator for filtered/policy-specific slices. **0** appears only where the coverage flag is `complete` and all relevant records are known.

| KPI | Formula / denominator | Coverage needed |
|---|---|---|
| รายการยืนยันจัด | Distinct confirmed/published **child** activity IDs in the public district catalog | `catalog=complete` |
| กลุ่มที่ต้องส่งตัวแทน | Distinct cluster IDs among required obligations (not all clusters) | `obligations=complete` |
| กลุ่มที่ส่งครบแล้ว | Required clusters where **all** applicable cluster–activity obligations have `submission_state=submitted`; submission is not verification | `obligations=complete` |
| เขตตรวจสอบแล้ว | Number of **required cluster–activity pairs** with independent `verified` or `locked` state | `obligations=complete` |
| ทีมผ่านเกณฑ์ระดับเขต | Sum of verified `qualified_teams` across **all** required pairs; `null` anywhere = unknown. Does not infer quota 1 or add direct-open applicants | `teams=complete` and `obligations=complete`, each pair non-null |
| ประเด็นติดตาม | Count of `state=open` in approved public issue list, not inferred from absence of rows | `issues=complete` |

No fabricated teams, groups, ready percentages, activity-stage policy or schedule data are built into the shipped page.

## 5. Gate for future main-system work (NOT included in this PR)

1. Competition 74 isolated instance/data owner confirms current catalog, stages and IDs, eligibility, >1 representative rules, canonical status mapping and applicable obligations.
2. Separate **contract/publication PR in `AcademicCompetitionManager`** covering sanctioned **aggregate-only static export**, permission checks, no PII, source completeness, publication lifecycle, rollback/revocation and storage isolation; no direct public API assumption.
3. Organizer/Area owner verifies totals, public text, official dates, approvals and the source snapshot. Data/privacy reviewer approves minimization and public exposure.
4. Add explicit data file + locked version/ref to **separate Sillapa PR**, run fail-closed contract/reconciliation tests with synthetic and approved export; manually audit published files and service worker cache. No localStorage or browser token is transferred.
5. Separate GitHub Pages production publication decision and regression checks (including cached/offline version). Invalidate older copies when revoking publication.

**Current result:** IA-3B can ship an **empty-state-only UI** after its own Merge acceptance. The data publication gate remains blocked.
