# IA-6 — Executive Decision Dashboard & Public Publication Operations

> Repository: infobwd/sillapa · Feature branch: \`feat/ia6-executive-decision-dashboard\`  
> Baseline: \`main\` at \`12e4ba3a99d5180e6e112495799a6af019caef9f\` (IA-5 PR #10 merged; verified 15 October 2026)  
> State: **FEATURE BRANCH / OWNER LOCAL-FIRST ACCEPTANCE PENDING / NOT MERGED**  
> Authority: \`SILLAPA74_INFORMATION_ARCHITECTURE_ROADMAP.md\` P6, \`SILLAPA74_INFORMATION_ARCHITECTURE_DATA_CONTRACT_DESIGN_LOCK.md\`, \`infobwd/repo-governance\` Local-First.

## 1. Verified source inventory, current truth and limitations

| System | Verified current state | IA-6 use |
|---|---|---|
| Public \`infobwd/sillapa\` | Static HTML/PWA; IA-1 six-section navigation; IA-2 draft 74 families, 70 and 73 references; IA-3 organizer readiness disconnected, IA-4 school local planner, IA-5 judge/venue local planner | Read **draft family metadata only**; no private person rows or device-local plans |
| IA-2 | 56 draft families (historically mapped 25 to 70, 29 to 73, 2 not directly mapped). Distinguish child grades and unresolved mapping | Count draft families only, **not approved 74 child competitions** |
| IA-3 | No authorized 74 public readiness snapshot, live cluster/team status or authoritative denominator. \`SILLAPA_IA3.mount({snapshot:null})\` | Official submissions, verified obligations, team counts = **—** |
| IA-5 | 73 judge aggregate history and device-only estimates; **no confirmed 74 judge assignments/venue allocation source** | Official judge and venue KPIs = **—**; never roll up device local estimates into district statistics |
| \`infobwd/AcademicCompetitionManager\` | Owns authenticated registration, judge, venue, assignment and authorization workflows. 73 Production is protected, 74 publication/roles/data acceptance is not established in this repo | No direct API/DB calls, no identity joining, no parallel write system |

Dates on this page are **planning references only**: **4 December 2026** = district submission of cluster representatives, *not universal entry close*; **21–24 December 2026** = provisional district competition window, **not verified room/day/slot**.

## 2. Delivered design / UX

- **\`#executive\`** is a subview of existing **ภาพรวม** (six primary navigation sections unchanged; IA-1 mobile bottom nav remains four destinations). A third prominent CTA on the home screen enters the executive view; on return, navigation highlights **ภาพรวม**. Existing \`#overview\`, \`#next\`, \`#prep\`, \`#readiness\`, \`#venue\`, \`#archive\`, \`#judges\`, and historical deep-links remain valid.
- Six **official-only** KPIs: confirmed 74 activity count; verified representative obligations **vs applicable approved denominator**; verified teams; confirmed judge availability **vs approved requirement**; confirmed rooms/venues **vs approved demand**; open issues. Each is **—** if source absent, scope absent, coverage incomplete or release invalid/revoked. \`0\` is allowed only for verified **complete** coverage with actual zero. Extra judge availability above minimum staffing is allowed.
- An independent strip displays counts of **draft family metadata**: total, historical 70 mapped families, historical 73 mapped families, and unresolved families. Each marked **draft/reference, not approved competition count**.
- **District/cluster** switch changes only authorized, stage-scoped KPI rows; no assumed district obligations from direct-open policies, no mixing local school plans or area/cluster counts. Missing stage is unknown, not zero.
- Source/provenance bar, source as-of timestamp, release version and publication identity when approved. Offline warning is always explicit even without a snapshot: PWA caches can be stale and a newer withdrawal cannot be verified offline.
- Public data-quality alerts: duplicate draft keys, unresolved mapping, missing official source/stage, partial coverage, stale snapshot (>7 days) and offline. These alerts are decision prompts, **not source-certified determinations**.
- Meeting-ready **CSV** with cycle/scope, source and publication metadata, each official metric's coverage, complete-denominator evidence, current draft counts and warnings. Sanitizes leading spreadsheet formula characters; **never exports teacher/student/judge names, school plan storage or private notes**.
- Four next-decision subjects: official activity/grade/policy, submission/verification, staffing/venue review, sanitized publication approval. Source dates and limitations explicitly carried to the view.
- No simulated or automatically fetched 74 production data. \`index.html\` calls \`SILLAPA_IA6.mount({release:null,revocation:null})\` **by design**. \`ia6-executive.js\` has **no private API, fetch, browser localStorage, publish or revoke button**.
- PWA \`sillapa-public-v8-ia6-20261015\` includes new IA-6 JS and CSS. Existing IA1–IA5 assets retained. Previous IA-5 test's hard-coded SW version assertion is updated to version-generic while retaining IA-5 asset requirements.
- Dark/light inherits main theme, responsive two/three/four-column cards, accessible buttons/selectors, thumb-target minimum 44px, smaller iPhone layouts and reduced-motion consideration.

## 3. Future proposed **aggregate-only** release contract (not deployed)

\`SILLAPA_IA6.validateRelease(doc)\` accepts a narrowly allowlisted **sillapa-ia6-public-v1** envelope after independent source approval, with fields:

\`\`\`text
schema, cycle_id="74", publication_id, publication_state="published",
data_version, source_system="AcademicCompetitionManager",
source_reference, source_as_of (ISO timestamp with timezone), published_at,
stage_summaries [1-2 stage-scoped aggregates for district and/or cluster]
\`\`\`

Each stage aggregate contains exactly \`stage_scope\`, \`coverage\` for six sections (\`activities, obligations, teams, judges, venues, issues\`) and nonnegative integer or null counts:

- \`activities_confirmed\`
- \`obligations_required / obligations_submitted / obligations_verified\`
- \`teams_verified\`
- \`judges_required / judges_available\`
- \`venues_required / venues_confirmed\`
- \`issues_open\`

**Coverage semantics:** \`complete\` requires all relevant numerator + denominator fields to be non-null integers, including **0** when authoritative; \`partial\` / \`missing\` requires those fields to be **null**. For obligations: \`0 ≤ verified ≤ submitted ≤ required\`; for venues: \`0 ≤ confirmed ≤ required\`; judge availability may exceed minimum requirement. Duplicated stage rows, invalid chronology, wrong cycle/source, and unexpected nested fields (potential PII) reject the **whole release**. This validator is a local boundary, **not an authentication signature or permission grant**, and does not currently load approved data.

**Future stage/cluster trends and child-grade analysis are blocked** until canonical IDs, scoped approved policy, per-cluster/grade coverage and reconciliation are provided. The UI intentionally does not invent trend charts, percentages or per-cluster zeros without a verified denominator. A separate versioned public projection PR is needed to implement those.

## 4. Publication lifecycle and revocation gates

Public publishing and revocation are **NOT implemented as clickable actions on static Pages**; no frontend can guarantee authorized removal from users' offline caches.

**Gate sequence (not approved yet):**

1. **Core/source owner** approves the public aggregate fields, rights and raw-source cycle 74 identity; freeze authoritative stage/cluster/grade semantics, policy applicability and publication scope.
2. **Data owner and privacy reviewer** verify minimization and any suppressed/small cohorts; official timestamps/version/IDs and denoms audited against core. Review all source files for personal-data leakage.
3. A separate **contract/source release PR** adds an approved static sanitized snapshot, validation and synthetic-vs-production reconciliation tests; **no direct private API URL**.
4. **Owner signs off** exact data version, summary, content, approval source and explicit publish scope; Merge/deploy handled separately.
5. After published Pages build, verify offline fresh/revisit, persistent/installed PWA Service Worker cache, and all official numeric totals against the accepted source. Record commit and release reference.
6. If correction/withdrawal occurs, publish a **revocation tombstone** \`sillapa-ia6-revocation-v1\` matching \`publication_id\` and \`data_version\`, with \`state="revoked"\`, authorized source reference, \`revoked_at\` (not older than original published date), and optional \`superseded_by\` publication. The local validator **fail-closes** revoked/invalid releases to **—**; it does not auto-fetch any tombstone without a separately approved publication implementation.
7. **Rollback/cache incident:** remove revoked static exports from new page builds, increment SW cache version and delete prior managed caches; prevent refetch of revoked files. Cached or offline devices may still retain old screenshots/exports; include conspicuous offline/stale disclaimer and communications. Never falsely claim remote deletion. Keep withdrawal audit log, affected version, incident decision, and re-publication authorization.

## 5. Local-First test and manual acceptance

In VS Code PowerShell, **run on exact PR commit**, no new GitHub Actions workflow required:

\`\`\`powershell
git fetch origin
git switch --detach origin/feat/ia6-executive-decision-dashboard
git rev-parse HEAD
git status --short
node --check ia6-executive.js
node --check tests/ia6-executive.test.cjs
node tests/ia2-registry.test.cjs
node tests/ia3-readiness.test.cjs
node tests/ia4-school-workspace.test.cjs
node tests/ia5-judge-venue.test.cjs
node tests/ia6-executive.test.cjs
git diff --check origin/main...HEAD
python -m http.server 8000
\`\`\`

Open \`http://localhost:8000/#executive\`; check Chrome desktop, iPad and iPhone UI, dark/light, accessibility, navigation/hash, quick links and export. For HTTPS install/offline cache, test an authorized HTTPS test environment or **after explicit Merge/Production approval**; plain LAN HTTP is not full PWA acceptance.

| Acceptance | Expected |
|---|---|
| Open the dashboard | Official six KPIs **—**, draft counts separate, no claimed official data, date labels provisional |
| Change district/cluster | No official totals invented in either stage; role/policy warning visible |
| Draft family data | Correct family total and 70/73/unresolved splits; **not** interpreted as officially confirmed child activity count |
| Source/provenance | No release/version/as-of invented; reason for absent source visible |
| Approved fixture, complete scope | Verified nonnegative integers including actual **0** permitted; applicable denominator displayed |
| Wrong cycle, extra PII field, duplicate stage, partial numerator, broken chronology | Whole bad snapshot rejected; fail-closed to **—** |
| Valid authorized partial scope | Only complete metrics shown; absent stage / partial component remains **—** |
| Revoked and invalid tombstone fixtures | Revoked publication produces **—**; untrusted revocation holds release closed |
| Offline fixture | Warning that a new revocation cannot be checked; never claim live |
| Export CSV | Source, version, stage, completeness, explicit **—**, only sanitized aggregates; no local plans/names |
| PWA/Nav | IA-1 six main and four bottom nav intact; IA-2 through IA-5 tests still pass |
| Core and Competition 73 | No calls/changes to registrations, judges, rooms, certificates, or 73 Production |

**Evidence recorded while developing this branch:** Five repository test scripts (IA-2/3/4/5/6) were replayed using the currently fetched source code in an isolated JavaScript runtime; all passed. **This is not a real Node local run**, GitHub Actions CI, browser click-through or installed PWA acceptance.

**Owner Node test/VS Code, device screenshots and production verification remain pending.** Explicit Owner permission is required to Merge this PR because GitHub Pages may publish \`main\` changes. The follow-up authorized-publication PR is also a separate sign-off and should not be bundled here.
