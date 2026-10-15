# Sillapa 74 — Information Architecture Delivery Roadmap

> **Status:** PROPOSED / documentation planning gate only — NOT a code/deployment authorization  
> **Paired Design Lock:** [Information Architecture & Data Contract Design Lock](SILLAPA74_INFORMATION_ARCHITECTURE_DATA_CONTRACT_DESIGN_LOCK.md)  
> **Repo:** infobwd/sillapa · **External canonical platform:** infobwd/AcademicCompetitionManager  
> **Prepared:** 15 October 2026

## A. Definition of the initiative

**Goal:** Turn a historical statistics PWA into a **public information system for preparing Competition 74** of สพป.กาญจนบุรี เขต 4, without cloning the core competition registration, scoring, or official results product.

The roadmap deliberately separates **information architecture / UI that can run with static data**, **verified data publication**, and **private business transactions owned by Competition Manager**. The current public site is a static snapshot. A roadmap item describing registration status, verified readiness, judge confirmation or venue assignment **must not be labeled implemented until real source and authority are validated**.

**Data integrity rules kept unchanged throughout all PRs:** Competition 73 frozen/protected; historical 70 catalog presented in every verified child grade/subevent, not as confirmed 74; unresolved family mapping remains pending; no student/teacher PII in Pages; planning in localStorage is not registered teams; approved 74 policy stage can be representative_only/open/representative_plus_open/closed; clusters may have more than one representative.

## B. Proposed PR series / strict sequencing

| Stage | Proposed PR/work package | Scope | Entry and exit gate | Does this change public UI? |
| --- | --- | --- | --- | --- |
| **P0 (this PR)** | **IA-0 · Design Lock + public contract + roadmap** | Lock proposed 6-section structure, personas, data vocabulary, authoritative sources, safety, PWA behavior, KPI formula, route migration and acceptance | Review content and owner explicitly approve design, then merge docs only | **No** |
| **P1** | **IA-1 · New shell / information hierarchy** | Homepage planning hero, status/freshness explainer, mobile four-button nav + More sheet, six content sections, anchor compatibility and data-state components | P0 approved; local browser regression + 8 legacy-view coverage, mobile/iPad accessibility | Yes, static UI only |
| **P2** | **IA-2 · Master 74 activity catalog and provenance** | Family → child-grade/type browser, filtered search, 70/73 source panels, 74 approval tags, unresolved map list, CSV/export with unambiguous source | Approved catalog mapping owner and sample fixtures; no implied 74 approval | Yes, static read-only |
| **P3** | **IA-3 · Organizer readiness empty states + public contract validation** | UI for cluster/stage readiness, first KPI/drilldown with **—** until verified, source labels; JSON schema and reconciliation checks for an authorized sanitized static export | P0 contract + explicit data owner/privacy review. Use static fixtures until feed publication approved | UI yes; feed only after separate source gate |
| **P4** | **IA-4 · School preparation workspace** | School-specific historic evidence, local plan checklist, official vs draft deadlines, explicit local-only storage, deep links to canonical entry platform only if approved | Test school separation and permission of any private deep link. Do not write School/Team data from Pages | Yes |
| **P5** | **IA-5 · Judge and venue readiness** | 73 aggregate patterns, proposed availability/mismatch warnings, confirmed vs suggested status, non-sensitive capacity and venue schedule | Judge owner/source approval; server-side conflict/role acceptance at core when introduced | Yes, public aggregates only |
| **P6** | **IA-6 · Decision analytics & publication operations** | Validated KPIs, district/cluster trends, export of meeting summary, quality alerts, publication version, update/revoke, cached-offline disclaimer | Data quality, freshness, denominator and availability reconciliation; owner acceptance | Yes, after trusted source is available |

**Do not bundle IA-1 through IA-6 in one PR.** Do not add a GitHub Actions test workflow just to show checks: LOCAL_FIRST is the current default. Existing GitHub Pages deployment machinery is independent from a new test workflow.

## C. Proposed six-section IA and legacy view migration worklist

| Target section | Legacy location(s) | P1 / P2 migration rule |
| --- | --- | --- |
| 1. ภาพรวมการเตรียมงาน 74 | overview, schedule template | Put 74 readiness and due actions above 73 medal charts; avoid invented KPI values |
| 2. รายการแข่งขัน 74 | next; historical portion of acts | Distinguish 74 draft vs 70/73 comparison; stage policies and child levels visible |
| 3. เตรียมแข่งขันของโรงเรียน | prep; selected historical schools | Retain saved local plans/selected school, but use “แผนในเครื่องนี้”; don't claim central receipt |
| 4. ความพร้อมผู้จัดและกลุ่มเครือข่าย | reps/groups may offer useful historical evidence | New 74 section starts disconnected/unknown until verified; 73 reps/groups are archived evidence |
| 5. กรรมการและสนามแข่งขัน | judges | Historical judge references and future readiness; **do not restore certificate CSV** |
| 6. คลังข้อมูลย้อนหลัง 70 / 73 | reps, groups, schools, acts, history charts | Preserve all current 73 detail and exports as archives, labeled consistently |

Mobile IA acceptance: bottom navigation at most **four direct buttons** (ภาพรวม / รายการ 74 / โรงเรียนของฉัน / เพิ่มเติม), with other two main sections and history reachable in “เพิ่มเติม”; desktop and tablet have all six destinations. Preserve filter and deep-link behavior, avoid overlap in fixed top/bottom controls and account for iPhone safe areas. Respect reduced motion and support large text/keyboard navigation as far as UI allows.

## D. Proposed delivery cards and acceptance

### IA-1 — Homepage and navigation (first implementation PR after P0)

**Deliver:** The first screen foregrounds purpose, published-versus-proposed state, latest source date, two upcoming milestones, recommended actions, and clear entry into activities/school/organizer. Users should not be greeted by a “74 result” table.

**Acceptance:**
- All six target destinations available across computer, mobile and iPad.
- Legacy eight hash routes either keep working or redirect to an appropriate section and contextual subview, with no lost historical content.
- First screen differentiates 73 historical evidence, 70 references, 74 draft, 74 confirmed and unknown; no synthetic confirmed counts.
- Splash/skeleton/pull-refresh/PWA install, version notice, offline snapshot and saved local plans do not regress.
- Visual check Safari iPhone + Chrome Android + desktop; contrast/tap targets and safe-area checked.

### IA-2 — Activity registry (public planning catalog)

**Deliver:** Searchable family → individual child competition event → level/type list; filters by group, stage, grade, approval and source cycle. Use a change log when an approved round-74 catalog later supersedes the draft.

**Acceptance:**
- Current **25 families / 63 matched historical 70 variants** stay visible according to verified source; **two unresolved families** remain flagged.
- No automatic creation of approved 74 activities from 70 rows; links back to source evidence.
- Every visible 74 item must have a status even if only “รอประกาศ”; no inferred registration quota.
- Export preserves IDs + source cycle and distinguishes family-level from child-level records.
- Compare total per source, unique event IDs, duplicate mappings and all grade bands against fixture.

### IA-3 — Organizer readiness and contract publication

**Deliver:** A data-state component with explicit source/source_as_of/publication_id/stale/offline state, plus organizer status cards. On a disconnected site, show empty state and explain which source is needed.

**Acceptance:**
- **No implied API:** static fixtures allowed for layout but clearly marked sample. Production counts only after public export authority.
- Distinguish counts 0 / unknown / no report; policy open at district must not increase obligations of cluster representatives.
- Submitted, reviewed/verified and locked shown separately; multiple representatives per approved policy.
- Drill-down source/stage/cluster consistent with the KPI denominator.
- Contract tests: missing fields, duplicate IDs, wrong cycle/stage, unpublished data, null timestamps and PII redaction.

### IA-4 — School workspace

**Deliver:** School history from cycle 73, plan-to-send checklist, source-approved activity criteria, calendar, and separate optional entry-link if/when the core service supports round 74.

**Acceptance:**
- Local planning is plainly labeled “เก็บในอุปกรณ์นี้”; never claim multi-school cloud synchronization.
- School ID rather than display name is the future canonical join. Public selector reveals no private per-student rows.
- Links to official register/entry must clearly leave the information hub; never make Sillapa into a second registration database.
- On-device offline test preserves existing local draft without unwanted modification.

### IA-5 — Judges and venues

**Deliver:** Planning tables for personnel needs and venue capacity, history-based suggestions, risk flags for team supervisors and conflicts, and data-owner-verified assignments.

**Acceptance:**
- No judge from 73 becomes an appointed 74 judge automatically.
- “ผู้ควบคุมทีม”, overlap and school participation flags described as **signals for manual review**, not legal determinations.
- Public display excludes private contacts/identifiers and unpublished personal assignments; core owns appointment/certificates.
- Capacity forecast visibly separate from published room/date/slot.

### IA-6 — Executive decision and publishing controls

**Deliver:** Meeting-ready scorecard, status by cluster/grade/stage, source freshness panel, data-quality alerts, export provenance, controlled release/revocation and incident playbook.

**Acceptance:**
- Every KPI points to authoritative source/version and complete denominator; no claim based on absent/partial feed.
- Reproduced aggregate totals reconcile with public export and exclude non-applicable obligations.
- Publication can be superseded/revoked; cached-offline users see old snapshot timestamp and explicit disclaimer.
- Performance, accessibility, installed PWA update and security acceptance passed before public publishing gate.

## E. Canonical data handoff / integration decision

**No production backend integration is part of IA-0.**

**Proposed path:** 
1. Canonical Competition Manager 74 source (separate acceptance from 73).
2. Authorized, minimized **read-only public data projection**, using approved stable cycle/activity/school/cluster IDs, publication states, stage policy and applicable denominator.
3. Versioned **static JSON** exported to the public hub first, with freshness and offline fallback; optional authenticated/private functions remain on core site.
4. After explicit review, future read-only endpoint if live data is necessary. Never publish database credentials or tokens inside client JS.

**Dataset acceptance owners (roles, not real named persons):**
- Competition organizer / district owner: source field and policy approval, official schedule and state.
- School/cluster data steward: reconciliation of obligations/submissions and mapping errors.
- Competition Manager maintainer: canonical keys, scope, permissions and export safety.
- Sillapa UI owner: data contract validation, labels, fallback and mobile usability.
- Data/privacy reviewer: public permission, exclusion of PII, archival and incident response.

No live feed should ship until these approvals are actually documented.

## F. Pre-publication gate matrix

| Gate | Evidence | Status for this documentation PR |
| --- | --- | --- |
| G0 — Draft design | Proposal/design-lock review, source links, owner comments | Created; awaiting owner approval |
| G1 — UI local tests | Exact commit SHA, manual/automated test commands, devices, screenshot/record of major flows | NOT RUN; implementation later |
| G2 — Data/source reconciliation | Mapping coverage, count formulas, missingness, class and stage policy, no PII | Not applicable until real data contract stage |
| G3 — Security/permission | No private API exposure, negative authorization tests, no private SW caching | Not applicable to docs; mandatory later |
| G4 — Staging | Separate core 74, rollback, browser and offline verification | NOT AUTHORIZED |
| G5 — Public Production | Explicit Owner GO, GitHub Pages release SHA and endpoint/cache checks | NOT AUTHORIZED |
| G6 — Post-release monitor | Version/freshness/incident response, update and rollback audit | Later |

Local code changes require exact-SHA evidence and no false CI-pass claims. For static Sillapa Pages, a successful GitHub Pages build only proves static publication, not that 74 external data are approved or safe.

## G. Tentative milestone constraints (not invented deadlines)

- **4 December 2026:** due date to send **cluster representative results/teams into district**, NOT a general registration closing date.
- **21–24 December 2026:** tentative district competition window, still awaiting confirmation at activity and venue levels.
- Official 74 registration windows, per-cluster competition dates, staff confirmation and venue details: **unknown** until published.
- Roadmap implementation start and finish dates remain **TBD**; dates above are event context and do not authorize accelerated or unsafe deployment.

## H. Recommendation after owner reviews IA-0

1. **Approve or amend Design Lock** wording, public/private source boundaries, six-section navigation, and representative/approval status definitions.
2. Merge this **documentation-only** PR after review; record its approved SHA and update documents' state from PROPOSED only with a separate owner-backed status change.
3. Start **IA-1 — homepage and navigation** as the next **code** PR with static-safe source labels, preserving all current historical data.
4. Only begin IA-2/IA-3 after the relevant activity/source owner has reviewed source references, mapping completeness and public publication permissions.

**Not in scope:** modifying Competition 73 results; creating new registration logic; moving or reusing personal data; changing Production 73; inferring official activity grades from another district's archival list; turning judges into certificates; new GitHub Actions workflows.

## I. Handoff prompt for a future conversation

~~~text
Continue work in infobwd/sillapa under LOCAL_FIRST repo-governance.
Read docs/SILLAPA74_INFORMATION_ARCHITECTURE_DATA_CONTRACT_DESIGN_LOCK.md,
docs/SILLAPA74_INFORMATION_ARCHITECTURE_ROADMAP.md,
docs/SILLAPA74_DECISION_HUB_DESIGN_PROPOSAL.md and README.md.
Check GitHub main + the docs PR merge/owner approval state first.
If the Design Lock is approved and merged, propose implementation of IA-1 only:
new six-section navigation and preparation-focused homepage with four-mobile-button
bottom nav + More sheet, preserve old links, eight previous view content and PWA.
All 70/73 historical vs 74 draft/confirmed status labels must remain truthful.
Do not create live KPI counts, new backend APIs, or write to CompetitionManager.
Build and test Local-First; open code PR; wait for separate Merge approval.
~~~
