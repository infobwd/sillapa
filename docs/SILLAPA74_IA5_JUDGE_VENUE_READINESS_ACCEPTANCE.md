# Sillapa 74 — IA-5 กรรมการและสนามแข่งขัน · Source Audit, Data Contract & Acceptance

> **Branch:** `feat/ia5-judge-venue-readiness` → `main`  
> **Baseline:** `main` = `5116bb989534a4a293e1e9374176307c059ffe07` (merged IA-4 PR #9; inspected 15 Oct 2026)  
> **Status:** IMPLEMENTED ON FEATURE BRANCH / OWNER ACCEPTANCE PENDING / **NOT MERGED**  
> **Architecture:** [IA roadmap P5](SILLAPA74_INFORMATION_ARCHITECTURE_ROADMAP.md), [IA data contract](SILLAPA74_INFORMATION_ARCHITECTURE_DATA_CONTRACT_DESIGN_LOCK.md), `infobwd/repo-governance` LOCAL_FIRST.

## 1. Actual source audit and safety boundary

- Public `infobwd/sillapa` is a **static GitHub Pages PWA**, intended as a **74 planning/information** website, not an official Competition Manager. It embeds archived round-73 contest results and historical judging assignments in `index.html`. The archive already contains some identified historical judges under `#judges` (pre-existing exposure; see existing privacy review). IA-5 **does not copy those names, schools, contact information or assignments to the new 74 workspace**.
- `#venue` prior to this PR had placeholders (four unknown metrics) and a link to `#judges` (round-73 archive). `#judges` remains untouched as an archival route.
- `ia2-registry.js` builds **56 draft 74 activity families** with temporary identifiers such as `draft-F01-A01`. These are not canonical `activity_id`, not official grade eligibility, and not approved cluster/area stage policy. Historical source is round 70 from another district and archived 73 results; cannot infer actual 74 judging requirements or venues.
- Checked `infobwd/AcademicCompetitionManager` `stabilize/73-prod` code: `components/JudgesView.tsx` and `components/VenuesView.tsx` contain authenticated judge and venue workflows, including assignment and schedule features. This is **not evidence** that round-74 backend data are accepted, public-safe, or deployable. Do **not** read/modify this core's 73 Production or call private APIs from Pages.
- The repository has **no approved public export** for official 74 judge availability, judge appointments, room capacity, dates, schedules, conflicts or stage-specific activities. Confirmed metrics are therefore displayed **— (unknown)**; never zero and never based on local planning or 73 rosters.
- The putative `docs/JUDGES_73_TO_74_REUSE_DESIGN.md`, `J0_73_PROFILE_RESULT.md`, `J1_SCHEMA_DESIGN.md` were not found at the tested core branch root `docs/`; no assumptions are made about their content or status.

## 2. Delivered scope

### IA-5 workbench

- Reuse IA-1 desktop six-section navigation, mobile/iPad four-button bottom nav and More sheet; mount on `#venue`, keep `#judges` and all other historical routes.
- Group comparison table: *draft 74 families*, *73 events that had judge data*, *distinct historical judges within that group* (not additive across groups), *73 judge assignments*, *73 same-school-participation observation counts* (aggregated from existing `JCON`), and **—** for official 74 appointments/venues. This is an archived reference, **not a list of 74 candidates**. Historical conflict signals are **not** disciplinary/legal judgments.
- Workbench activity cards with filter by group, search, estimated stage (**cluster** / **district**, as planning scope only), unresolved estimates, and flagged manual-review items. Paginates 12 cards at a time to avoid an unwieldy mobile catalog.
- Device-only estimates per draft family × stage: **judges needed**, **rooms needed**, **estimated capacity per room (people)**. All optional; unset or invalid inputs are unknown, not zero. No fabricated roster, venue names, times or required headcount. Stage choices are **not** assertions that the event is approved at that stage.
- Five checkable follow-up **signals for manual review**: team supervisor duty, same-school team participation, schedule/duty overlap, judge availability, and room/equipment capacity. These flags are neither official case decisions nor confirmations; no people are identified.
- KPI tiles separate **draft family count**, **unknown confirmed 74 appointments and venues**, and **device-local estimates**. A total for needed judges or rooms is displayed only when **every draft family for the selected stage** has an estimate; otherwise **— / not complete**. Counts on offline device are not central statistics.
- CSV export of the currently filtered **device-only plan** (no people). Prefix formula-like text to mitigate spreadsheet injection. Label every exported row as unconfirmed local plan.
- Explicit source status and provisional **21–24 December 2026** date warning; no fictional room/date/slot.
- `ia5.css` responsive styles that inherit theme/fonts, touch targets, focus treatment, horizontal-scrollable historical table and reduced-motion. `sw.js` public shell `sillapa-public-v7-ia5-20261015` adds IA-5 CSS/JS without storing estimates in PWA Cache.

### Data partition and privacy

- Local key `sillapa74:judge-venue-planning:v1` stores only `draft-Fxx-Ayy|cluster/district` → aggregate integer estimates and booleans. No fields for names, notes, student rosters, judge IDs, school contacts or credentials. Browser-local storage is not role-based secure storage, not a shared planner, and not synced. Clearing browser/site data deletes it; CSV export is an optional backup.
- `ia5-judge-venue.js` contains **no network fetch or backend mutation**. Current app passes `snapshot:null`; no newly published staff data are injected into Pages.
- The stand-alone `validatePublicSnapshot` function defines a **future proposal** to reject unapproved cycle/source/schema, incomplete coverage, PII fields, duplicate canonical `activity_id|stage` keys, unsafe counts and inconsistent chronology. It does **not** automatically load anything and it is **not itself publication approval**.
- **Approval gate for any real 74 data:** canonical activity IDs and stage policy mapping, data-owner signoff, source version/as-of, safe aggregate rows, complete denominators, permission/privacy review, published/revoked process, and separate QA/Merge/Production authorizations. Do not infer that `draft-Fxx-Ayy` can join to official 74 activity IDs by display title.
- The central Competition Manager remains owner of actual judge/personnel roster, appointment letters, certificates, authenticated conflict review, official venues, capacities and schedules. None of these writes are duplicated in Sillapa.

## 3. Proposed future public-only contract, **not deployed**

```json
{
  "schema": "sillapa-ia5-public-v1",
  "cycle": 74,
  "publication_status": "approved",
  "source_system": "AcademicCompetitionManager",
  "source_as_of": "2026-10-14T11:00:00+07:00",
  "published_at": "2026-10-15T11:00:00+07:00",
  "coverage": {"activities":"complete","judges":"complete","schedule":"complete","venues":"complete"},
  "rows": [{
    "activity_id": "official-example-001", "stage": "district",
    "required_judges": 4, "available_judges": 2, "confirmed_rooms": 0,
    "confirmed_slots": 0, "conflict_count": 1
  }]
}
```

**Illustrative schema only.** The values above are synthetic contract-test examples, **never used as real UI data or published counts**. A future publishing PR must add full coverage/authoritative IDs and explicitly re-review privacy/security; the validator does not accept individual assignments or personal fields. If any source dimension is partial, the current view must keep official KPIs as **—** until safe denominator semantics are separately specified. No external booking/registration/appointment URL is inferred.

## 4. Local-first QA and Owner acceptance

Run in VS Code PowerShell on the PR's exact head, with no GitHub Actions required:

```powershell
git fetch origin
git switch --detach origin/feat/ia5-judge-venue-readiness
git rev-parse HEAD
git status --short
node --check ia5-judge-venue.js
node --check tests/ia5-judge-venue.test.cjs
node tests/ia2-registry.test.cjs
node tests/ia3-readiness.test.cjs
node tests/ia4-school-workspace.test.cjs
node tests/ia5-judge-venue.test.cjs
git diff --check origin/main...HEAD
python -m http.server 8000
```

Open `http://localhost:8000/#venue`. Test latest Chrome/Edge desktop, iPad portrait/landscape, iPhone Safari, dark/light, navigation, existing historical judge page, pull to refresh, and installed PWA/offline on approved HTTPS test/Pages **only after Merge approval**. Local LAN plain HTTP is not a full HTTPS PWA test.

| Acceptance scenario | Expected |
|---|---|
| First open `#venue` | 56 **draft** families; all 74 official appointments, confirmed venue/time = **—** |
| Historic 73 comparison | Group-level judge/event/seat and observation counts with no new judge name; historical values never treated as 74 |
| Set district estimates for two draft families only | Denominator 2/56; overall planned total stays **—** until complete |
| Enter people-per-room capacity | Persists on device only, explicitly expected not verified |
| Set stage `cluster`, then return `district` | Separate estimates/risk flags per stage; stage itself not approved stage policy |
| Supervisor + same-school + schedule flags | Manual-review signal only, with no name or implied misconduct |
| Check/uncheck multiple flags on iPhone | Open checklist remains open, thumb-friendly input, no false saving toast |
| Filter/search and Show More | Matching records and counts; 12 records per batch |
| Download CSV | Only current filtered local draft values with formula-injection protection and explicit not-official status |
| Clear browser storage/blocked storage | No silent success; visible warning on write error; CSV backup available |
| Simulated future dataset has PII, wrong cycle, incomplete coverage | Validator rejects; **no UI autoload** |
| Old nav and data views | All remain usable; `#judges` remains historic 73; IA-2/IA-3/IA-4 suites pass |
| Production 73 & staging 74 core | Unchanged by this PR; no API mutation or judge-certificate creation |

### Evidence status

- **In-tool V8 replay:** IA-2/IA-3/IA-4/IA-5 source suites all PASSED at branch during authoring, including draft-family/safe-publication tests and inline JavaScript parsing. This is a replay, **not** the Owner's actual Node runtime, and **not** GitHub Actions/CI.
- **Local Node in Owner's VS Code:** NOT RUN / must capture exact SHA, Node version, outputs.
- **iPhone/iPad/Desktop interactive acceptance and installed PWA:** NOT RUN / must be performed by Owner.
- **Published/verified 74 source, backend rights, private roster and official venue schedule:** NONE APPROVED.
- **Merge and public Pages Production:** NOT AUTHORIZED in this PR until separate explicit Owner instruction.

## 5. Next decisions

After local device acceptance, Owner may separately authorize Merge PR. GitHub Pages may deploy automatically when `main` changes; check deployed revision and stale-cache behavior separately. Proposed IA-6 executive controls should still refuse to interpret draft or local planning numbers as approved readiness. If the Owner wants actual judge availability/volunteer role or venue capacity, implement those in `AcademicCompetitionManager` with authentication first, then separately approve public minimal projection. Never add or export personal data from Pages merely to power this dashboard.
