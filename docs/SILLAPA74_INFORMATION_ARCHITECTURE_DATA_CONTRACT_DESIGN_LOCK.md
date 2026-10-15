# Sillapa 74 — Information Architecture & Data Contract Design Lock

> **Version:** 0.1 · **Review state:** PROPOSED FOR OWNER APPROVAL (not yet a production contract)  
> **PR type:** Documentation only; not authorization to modify runtime, backend, database, or publish new data  
> **Date:** 15 October 2026 · **Repository:** infobwd/sillapa  
> **Paired roadmap:** [SILLAPA74_INFORMATION_ARCHITECTURE_ROADMAP.md](SILLAPA74_INFORMATION_ARCHITECTURE_ROADMAP.md)

## 1. Purpose and boundaries

**Official product description to use consistently:**  
**ระบบสารสนเทศเพื่อเตรียมจัดการแข่งขันงานศิลปหัตถกรรมนักเรียน ครั้งที่ 74 สพป.กาญจนบุรี เขต 4**

This is a **planning information and decision-support hub** for the area organizing team, cluster organizers, schools and teachers. It answers: *What is planned, what is officially confirmed, what must be prepared, who is responsible, and what information is still missing?*

It is **not** the official round-74 results/reporting site, registration system, scores system, school account system, judge-certificate generator, or a second Competition Manager. Retain the distinct purposes of both repositories:

| Responsibility | Owner/source of truth | Public Sillapa hub behavior |
| --- | --- | --- |
| 73 historical results, awards and past judge assignments | Approved 73 historical record; protected in AcademicCompetitionManager | Display labeled historical reference/snapshot; no writeback |
| 70 activity/grade references | Round-70 source catalog, with exact source/date and matching status | Display **all verified child events/grades/types** when a 74 draft family reuses a round-70 activity; never call them officially approved for 74 |
| 74 activity policy, stage, team entry and promotion | AcademicCompetitionManager **after** 74 acceptance, plus authorized organizer decisions | Read approved/sanitized data; link into canonical registration flow |
| School/team/student/teacher personally identifying data | AcademicCompetitionManager, server-side authenticated permissions | Never export or cache private rows on GitHub Pages |
| 74 public readiness/status, announcements and schedule | Organizer-approved publications / future approved public export | Show dates, approvals, data freshness, public aggregates, and source link |
| Teacher's provisional planning list | Local browser (current); central service only if separately designed and approved | Clearly mark **แผนในเครื่องนี้**; never label as submitted or verified |
| Registration, score recording, judge appointments and certificates | AcademicCompetitionManager | Deep-link to authorized service only, never implement duplicate write operations |

**Guardrails:** Do not mutate results/teacher/student/judge history from Competition 73; keep /sillapa73/ and its database isolated; do not imply Competition 74 staging/runtime has already passed acceptance. Follow infobwd/repo-governance LOCAL_FIRST and separate Merge, Staging and Production decisions.

## 2. Current baseline verified before this Design Lock

As inspected in the Sillapa main branch on 15 Oct 2026:

- Static GitHub Pages PWA with **eight existing views:** overview, reps, groups, schools, acts, judges, next, prep. Historic rows and the draft catalog are embedded in index.html; the round-70 reference is in round70-catalog.js.
- 70 reference mapping currently covers **25 draft activity families / 63 historical grade-level entries**. **กลุ่มนาฏศิลป์** and **กลุ่ม Soft Power** have unresolved exact matches; keep them unresolved rather than infer types/grades. The round-70 list used is from another area's published archive, **not** an authenticated competition-74 announcement for Kanchanaburi Area 4.
- A teacher's personal plan uses browser-local storage; there is no accepted central school-plan repository or live 74 entry/status feed.
- PWA manifest, install instructions, splash, skeleton, pull-to-refresh and public service-worker cache already exist. Refresh reloads a **snapshot**; it is not synchronization of 74 registrations.
- AcademicCompetitionManager contains historical capabilities for entries, judges, venues, scoring, certificates, announcements and role-based workflow. Their **74 scope, permissions and deployment remain subject to separate audit/acceptance**; finding source code is not proof of live availability.

The earlier [Decision Hub proposal](SILLAPA74_DECISION_HUB_DESIGN_PROPOSAL.md) remains a planning input, not a backend go-ahead. This document refines the next architecture and contract subject to Owner review.

## 3. Six information-architecture sections (target navigation)

| # | Target section / recommended Thai title | Primary questions answered | Proposed primary content | Data at first implementation |
| --- | --- | --- | --- | --- |
| 1 | **ภาพรวมการเตรียมงาน 74** | What is due, confirmed, pending, missing? | Schedule, trusted KPIs, latest announcements, actions and risks | Existing published dates and source-labeled records; otherwise “ยังไม่มีข้อมูลยืนยัน” |
| 2 | **รายการแข่งขัน 74** | What may run, at which stage/grade, and under what policy? | Authoritative family → child item → grade/type, draft vs confirmed, 70/73 comparison, official criteria/source | Local draft + historical references until official 74 feed passes acceptance |
| 3 | **เตรียมแข่งขันของโรงเรียน** | What has our school planned? What is genuinely registered? | School selection, historical benchmark, plan checklist, deadlines, authorized link to real entry | Local provisional plan only, explicitly labeled |
| 4 | **ความพร้อมผู้จัดและกลุ่มเครือข่าย** | Which groups have reported, been checked, and been approved? | Stage-scoped sending/verification matrix, applicable denominator, drill-down by cluster and activity | UI empty/not connected until a sanctioned public aggregate exists |
| 5 | **กรรมการและสนามแข่งขัน** | Who is suitable/available, where are capacity gaps and conflicts? | Historical staffing patterns, verified venue availability, needs/conflict flags, assignment readiness | Non-sensitive historical aggregates only; **not** confirmed appointments |
| 6 | **คลังข้อมูลย้อนหลัง 70 / 73** | What can we learn from previous competitions? | 73 results, old representatives, judges, school/category statistics, 70 catalog and mapping evidence | Existing approved historical snapshots |

### 3.1 Navigation and migration

- **Desktop:** six clearly labeled top/side navigation destinations; expandable subviews for stage/cluster, activity, judge and history. Do not expose an eighth primary “results” tab that implies a separate official 74 result system.
- **Phone/PWA:** bottom navigation **four direct destinations** (ภาพรวม, รายการ 74, โรงเรียนของฉัน, เพิ่มเติม). In **เพิ่มเติม** place ความพร้อมผู้จัด, กรรมการ/สนาม, คลังย้อนหลัง, การติดตั้ง PWA/การช่วยเหลือ. Offer the same six content sections and accessible labels on desktop/iPad; avoid icon overlap and thumb-unreachable modal close controls.
- **Legacy anchors/links:** old hash destinations must still resolve or redirect predictably. Suggested mapping: overview→1; acts and next→2 (with historical comparison subview); prep→3; reps/groups→4 if it has verified 74 aggregates, **otherwise** history subview 6; judges→5 with 73 disclaimer; schools→3 or historical school profile within 6 depending on selected context. Exact route remapping is a UI acceptance task, not deployed by this PR.
- Search and filters must have scope labels (“รายการครั้งที่ 74 (ร่าง)”, “ข้อมูลครั้งที่ 73”) and restore sensible user context. Keep text legible in Anuphan/Thai and on tablet, portrait/landscape, keyboard and reduced-motion modes.

### 3.2 Screen state and nomenclature

- Display **source era, source state, refreshed-at, and authoritative-at** near every decision-relevant card/table; never display stale snapshot as live.
- Four distinct labels for historical/proposal/approval: **ข้อมูลย้อนหลังครั้งที่ 70/73**, **ร่างครั้งที่ 74**, **ยืนยันแล้วครั้งที่ 74**, **รอข้อมูล/รอตรวจสอบ**.
- **Zero (0)** means a confirmed zero count from a complete applicable dataset; **—** means unknown/unconnected/unreported. Never substitute zero for null.
- “ลงแผน” is not “สมัครแล้ว”; “กลุ่มส่งแล้ว” is not “เขตรับรองแล้ว”; “เสนอกรรมการ” is not “แต่งตั้งแล้ว”.

## 4. Canonical public data model / proposed contract

**Contract state: DESIGN ONLY.** The following object and fields are **proposed** and are **not** existing endpoints, tables, migrations, or guaranteed runtime names. Final exact API paths, credentials, permissions and schema must be approved in the Competition Manager project. JSON may initially be generated as an **authorized static export**; never guess that a live API exists.

### 4.1 Identity and stable linking

| Entity | Required canonical key | Required relationships / cautions |
| --- | --- | --- |
| Competition cycle | cycle_id | Keep 70, 73, 74 distinct and preserve each source's publication identity |
| Activity family | family_id (74 canonical) | May contain multiple child events, subtypes and grade bands |
| Competition event | activity_id + cycle_id + stage_scope | Single grade/type entry of a family, with official approval state; don't group away levels |
| Source crosswalk | from_cycle_id, from_activity_id, to_cycle_id, to_activity_id, mapping_state | Support one-to-many / many-to-one mapping and unresolved/partial/reviewed evidence |
| School and cluster | school_id, cluster_id | Official canonical identifiers; never join by Thai display names alone |
| Stage policy | activity_id + stage_scope + policy_version | Includes eligibility and quota rules, may differ by activity/cluster |
| Schedule/venue | schedule_id, venue_id + applicable activity_id | Publish confirmed time/room only with an approved schedule |
| Public status aggregate | cycle_id, stage_scope, activity_id, optional cluster_id, data_version | Counts require coverage/completeness, timestamp and permitted publication flag |

**Stage terms:** cluster = กลุ่มเครือข่าย; district = เขตพื้นที่. 74 stage policies may be **representative_only**, **open**, **representative_plus_open**, **closed**. A cluster may send more than one representative team if explicitly authorized. The website must not hard-code one team/cluster or infer an application deadline from the representative reporting deadline.

### 4.2 Proposed public export envelope (illustrative shape only)

~~~json
{
  "schema_version": "sillapa-public-read-v1-proposed",
  "cycle_id": "74",
  "publication_id": null,
  "publication_state": "draft",
  "data_version": null,
  "source_system": "AcademicCompetitionManager",
  "source_reference": null,
  "source_as_of": null,
  "published_at": null,
  "generated_at": null,
  "coverage": {
    "stage_scope": "district",
    "completeness": "not_connected",
    "expected_units": null,
    "reported_units": null
  },
  "activity_catalog": [],
  "public_readiness_aggregates": [],
  "published_schedule": [],
  "announcements": []
}
~~~

All dates must be ISO 8601 with explicit timezone or documented Thailand-local date semantics. Null fields above are **deliberate unknowns**: they are not real missing data from an active 74 feed. Publish an export only if schema validation, authorization, source/version checks and Owner approval pass.

### 4.3 Required fields per public record

- **Activity child item:** cycle_id, family_id, activity_id, title, activity_type/subevent, grade_band, stage_scope, competition_mode/policy, eligibility reference, representative quota **when confirmed**, status, source_ref, source_as_of, verified_by_or_approval_ref (public-safe), official_criteria_url if approved, updated_at.
- **Crosswalk item:** source_cycle_id, source_activity_id, source_title, source_grade, mapped_74_activity_id (nullable), mapping_type, match_confidence/state, reviewed_at, review_reference. For a 70 family carried over, enumerate **all actual subevents/grade bands**; missing matches stay flagged instead of automatically mapping to an arbitrary grade.
- **Cluster readiness aggregate:** cluster_id, applicable_activity_id, policy/eligibility version, submission_state, coverage flag, submitted_count (nullable), accepted_count (nullable), public verified_at (nullable), source_as_of. Do not include student/teacher names or contact details.
- **Judge readiness aggregate:** activity_id, stage_scope, suggested_count, verified_available_count, required_count, conflict_count, public classification; individual identities and assignments must remain private unless separately approved.
- **Venue readiness aggregate:** activity_id, venue_id/public label, room_capacity (confirmed or unknown), slot, allocation_state, conflict flag, published_at. Do not label tentative planning as confirmed.
- **Schedule/notice:** event_type, start/end, date_confidence, approval state, source_ref, public official link, last_updated.

### 4.4 State machines and freshness

Use **separate dimensions**, not a single “status” field:

| Dimension | Proposed values | Rendering rule |
| --- | --- | --- |
| Approval/publication | draft → under_review → confirmed → published; superseded is archived | Only confirmed/published with acceptable source is counted as official 74 information |
| Connectivity/freshness | not_connected / fresh / stale / unavailable / cached_offline | Clearly show data timestamp and fallback reason |
| Data completeness | not_reported / partial / complete / not_applicable | An unreported cluster is **unknown**, not 0 |
| Cluster submission and verification | not_started / drafting / submitted / needs_revision / verified / locked | submission and verification must be shown separately; no automatic advancement |
| Judge/venue planning | suggested / awaiting_confirmation / confirmed / unavailable / conflict | Historical suggestion is never automatic assignment |
| Historical match | unmatched / partial / reviewed / confirmed_reference | “Confirmed reference” only means the historical match is confirmed; it does **not** approve the 74 activity |

**Public publication policy:** All 74 status data must be a controlled, approved sanitized snapshot or accepted read-only endpoint. If publication is withdrawn/superseded, show the revision and avoid orphaned direct links. Preserve provenance: which source supplied what, who authorized publication (a public-safe role/ref), and when.

### 4.5 Privacy and security

- Public read-only export only; no access tokens, phone numbers, private judge contacts, identity numbers, student/teacher member lists, personal files, private notes, or role-specific admin data.
- Authorization, eligibility, certificate generation, registration and score writes remain **server-side** at AcademicCompetitionManager; a public JavaScript hidden control is not a permission check.
- Expose counts only at aggregate granularity approved for public release. Small/sensitive cohorts may require suppression; determine thresholds with the data owner before publishing.
- Offline/PWA cache **only intentionally public versioned files**, no authenticated API responses or personal documents. A fresh install from GitHub Pages must not expose private team records.
- Cross-origin API access, CORS, credentials, rate limiting, cache-control, release/revoke strategy and audit logs are **not approved or implemented** in this PR.

## 5. KPI catalog and the executive overview

KPI cards must be driven by verified public data. Each KPI requires a named source, stage, applicable denominator, freshness and drill-down.

| KPI | Formula / intended meaning | Show “—” when |
| --- | --- | --- |
| Approved 74 activity items | Count of distinct active child activity_id + stage_scope with confirmed/published 74 approval | Only the draft/70/73 list exists |
| Applicable clusters sent representatives | Numerator = applicable cluster/activity obligations reaching submitted-or-higher; denominator = all obligations under approved representative policy | Policy or submission coverage is unknown; exclude activities open directly to district |
| Cluster submissions verified | Verified obligations / submitted obligations, with totals displayed separately | No authoritative submitted/verified feed |
| District-ready teams | Unique approved eligibility/team IDs for district; split representative versus direct-open and deduplicate | Only provisional school plans or 73 data available |
| Judges prepared | Verified available/publicly publishable staffing capacity versus approved requirement, by event | Only past judges/suggestions exist |
| Venues planned vs confirmed | Count of public approved assignments versus published demand, distinguish forecast and confirmed | Slot, capacity or assignment not approved |
| Risk/attention items | Explicit incomplete, overdue, conflicting or stale obligations; show owner/action/deadline | Evidence or responsibility lacks approval |

Do not invent current KPI numbers. The homepage must include an **action list** (missing information, next owner decision, deadline), a **source/freshness bar**, and a **scope switch** (district/cluster), rather than lead with historical medal charts. Historic medal/score analyses remain in section 6.

## 6. Confirmed planning schedule versus unknown dates

- **4 December 2026:** cluster groups' **deadline to submit representative results/team information to district**. It is **not** a general application deadline nor the date of all cluster competitions.
- **21–24 December 2026:** **provisional district competition window**, not a confirmed venue-specific timetable.
- Cluster competition dates, 74 opening/closing of registration, specific venue/time and official activity approval are **unknown until published**. Display TBA / awaiting announcement, not fabricated timestamps.

Every future date displayed must carry event type, certainty, source and publication version.

## 7. Read-only connection design (separate delivery gate)

Recommended first integration: **approved sanitized versioned JSON export** generated by AcademicCompetitionManager/authorized organizers, then deployed/published as static data consumed by Sillapa. Do not add a direct database connection, public secret, or live browser credential to GitHub Pages. A later **read-only public endpoint** may be considered after API/security and staging acceptance.

Required gate sequence:

1. **Source inventory + field-level approval** with Competition Manager owner, including historical/74 cycle and stage policy semantics.
2. **Data contract + crosswalk reconciliation** on isolated fixtures; expected totals and duplicate handling checked against approved source.
3. **Privacy review + public publication authorization**, including embargo, revisions and rollback.
4. **Static/public export with as_of and completeness**; schema validation, reliable 404/offline handling and stale labeling.
5. **Local-First + staging acceptance** (per repo-governance), including malicious client/PII and cross-school scope tests for future private deep links.
6. **Separate Production GO** for the public feed. This Design Lock does not grant it.

## 8. Acceptance criteria for approval of THIS document

- [ ] Product identity is “preparation information system” across proposed IA; no duplication of round-74 registration/results.
- [ ] Target six sections and old→new migration, including practical mobile navigation and accessibility, are unambiguous.
- [ ] 70 complete grade/subevent reuse is preserved and two unmapped families are marked unknown.
- [ ] Every proposed public record has stable IDs, stage, approval, provenance, freshness, completeness, privacy classification.
- [ ] Unknown ≠ zero; plan ≠ submission; past judge ≠ appointed judge; submitted ≠ verified.
- [ ] Cluster→district with four registration policies and multi-representative support is specified.
- [ ] 4 Dec deadline and 21–24 Dec provisional period are labeled correctly.
- [ ] Public data may be published only through explicit sanitization/approval and without private participant data.
- [ ] Separate roadmap identifies each PR, evidence, owner review and deployment gate.
- [ ] Scope of PR remains **docs + README pointers only**; no HTML/CSS/JS/SW/DB/API changes or hidden deployment.
- [ ] Final owner approval is recorded separately after review; **PROPOSED ≠ APPROVED**.

## 9. Reference and change control

- [Existing Decision Hub proposal](SILLAPA74_DECISION_HUB_DESIGN_PROPOSAL.md): baseline of organizer and school needs, four policy modes and tentative milestones.
- [Round 70 reuse + UX acceptance](ROUND70_LEVEL_REUSE_AND_UX_ACCEPTANCE.md): source coverage, 63 level-specific references and unresolved mapping.
- [PWA acceptance](PWA_ACCEPTANCE.md): installed/offline behavior already in Sillapa.
- [AcademicCompetitionManager feature inventory](https://github.com/infobwd/AcademicCompetitionManager/blob/analysis/mysql-migration/docs/FEATURE_INVENTORY.md): distinction between 73 baseline and 74 audit.
- [Competition 73 audit → 74 plan](https://github.com/infobwd/AcademicCompetitionManager/blob/analysis/mysql-migration/docs/COMPETITION_73_AUDIT_74_PLAN.md): protected 73 and separate 74 staging.
- [Repository governance](https://github.com/infobwd/repo-governance): LOCAL_FIRST, review and deployment separation.

If older proposal wording conflicts with this new **proposed** architecture, surface the conflict during review rather than silently treating either as formally approved. After Owner approval, record the reviewed merge SHA and update the plan's status via a separate documentation change. No automatic schema/runtime rollout.
