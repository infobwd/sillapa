# IA-3C — Organizer Readiness Dashboard · Implementation and Acceptance

**Target PR:** `feat/ia3-organizer-readiness-dashboard` → `main`  
**Implementation gate:** PENDING OWNER ACCEPTANCE · **Merge / Production / public feed: NOT APPROVED**  
**Source audit:** [IA-3A public contract audit](SILLAPA74_IA3_SOURCE_AUDIT_DATA_CONTRACT.md)  
**Existing baselines:** [IA-1](SILLAPA74_IA1_IMPLEMENTATION_ACCEPTANCE.md), [IA-2](SILLAPA74_IA2_ACTIVITY_REGISTRY_ACCEPTANCE.md)

## Implemented IA-3B

- Replaced only `#readiness` placeholder with a distinct, **read-only** IA-3 dashboard; existing 6-section navigation, mobile 4-button bottom bar, More sheet, historic `#groups`, 70/73 registry, saved school plan, PWA install and historical views are not removed.
- Six planning KPIs render **—** without approved input. Cards explain the unit and denominator (distinct groups, distinct cluster–activity pairs and count of verified teams).
- Controls for group, category, activity, stage, readiness status; approved activity/group options only appear if a validated public snapshot exists. With no release, filters are visibly disabled, not filled with fictitious names.
- Distinct submission vs verification labels, responsive desktop table / mobile stacked cards, stage-specific planning/submission/review columns, per-KPI source+timestamp+publication state and overall publication metadata panel, sanctioned issues list, empty and rejected-data states.
- Shows 4 Dec 2569 representatives deadline and **tentative** 21–24 Dec 2569 district schedule; retains explicit caveat that this is not a registration closing date.
- Contract validator rejects cycle != 74, unpublished release, unknown stages/policies, unexpected fields, duplicate keys/pairs, inconsistent approval times, and fabricated/open-only cluster obligations.
- Future mounted approved snapshots are presented as a *dated publication*, with explicit offline/cached labeling. Present shipped dashboard is always disconnected; no automatic REST request or JSON feed is installed.
- Added `ia3-readiness.js`, `ia3.css`, `tests/ia3-readiness.test.cjs` and rotated SW shell to `sillapa-public-v5-ia3-20261015`. No dependencies or GitHub Actions workflows.

## IA-3A findings and blocked items

- Private `AcademicCompetitionManager` includes role-scoped S73 aggregate/registration/representative capabilities, but these are **not approved anonymous S74 public data**. Latest inspected S74 PR #110 remains open and does not constitute a public export.
- There is no approved live source, verified cluster roster for all 74 activities, verified official 74 stage policy for each child event, authoritative quotas, submitted/verified totals or public issues feed.
- Real cards, group table, verified teams and issue list stay in **Empty State**. The historical 73 source remains accessible separately, not repurposed as current status.
- The GitHub Pages URL is separate from this unmerged PR. Do not claim public deployment or browser QA passed from source review alone.

## Local-First acceptance commands (Owner executes against exact HEAD)

```powershell
git clone https://github.com/infobwd/sillapa.git
cd sillapa
git fetch origin
git switch --detach origin/feat/ia3-organizer-readiness-dashboard
git rev-parse HEAD
git status --short
node --check ia3-readiness.js
node --check tests/ia3-readiness.test.cjs
node tests/ia2-registry.test.cjs
node tests/ia3-readiness.test.cjs
git diff --check origin/main...HEAD
python -m http.server 8000
```

Browse locally on computer: `http://localhost:8000/#readiness` (Ctrl+C stops server).

For **real iPhone/iPad testing**, put the computer and mobile device on the same Wi-Fi. Run `python -m http.server 8000 --bind 0.0.0.0` and open `http://<COMPUTER_LAN_IP>:8000/#readiness`. Ordinary LAN HTTP cannot fully exercise production Service Worker/PWA install because those require secure context; use localhost on the computer or, **only after approved Merge/Pages publication**, the HTTPS GitHub Pages site to test installed iPhone PWA/offline/refresh. Do not change production just to test this PR.

## Owner test matrix / acceptance checklist

| Area | Expected behavior | State |
|---|---|---|
| No approved snapshot | 6 cards show **—**, no invented 0; provenance says not connected; filters disabled | Code review + JS test; browser acceptance pending |
| Invalid/unpublished/wrong 73 feed | Reject entire snapshot, show error and unknown, no partial leaked records | Contract checks included |
| True complete 74 zero | 0 accepted only with all required source/coverage metadata | Synthetic contract test included |
| More than 1 representative | Verified 2+ teams counted without quota=1 assumption | Synthetic contract test included |
| Representative-only vs open vs closed | No phantom group obligation from `open` or `closed`; combined mode supported | Synthetic contract test included |
| Submitted / pending / revision / verified / locked | Two independent state dimensions; submitted != verified | Contract/UI code check; browser pending |
| Group/activity/stage/status filtering | Stage/category/cluster/pair filter consistent, composite activity+stage keys, no full-denominator KPI shown after filtered slice | Synthetic contract test included |
| Android/iPhone 375–430px | Cards 2 columns, filter controls 2 columns, rows become cards, no overlay bottom navigation | Real device NOT RUN |
| iPad portrait/landscape | Mobile/tablet nav as IA-1, responsive rows/table, no horizontal clipping | Real device NOT RUN |
| Desktop >= 1030px | 6-section nav; 10-column scrollable table only if approved data | Browser NOT RUN |
| Dark/light / keyboard / reduced motion | Uses IA tokens and focus-visible controls; toggle and focus checked | Browser NOT RUN |
| PWA install / offline / reload | Static shell includes IA-3 files; offline uses last shell, no private API | SW source review; installed device NOT RUN |
| Legacy anchors, IA-2, school draft | Navigate `#groups`, `#next`, `#prep` unchanged; rerun IA-2 local test | Regression NOT RUN on Owner local Node |
| Backend/73/PII | Zero modifications to core DB/73 Production; no personal data or fetch in IA-3 | Git diff review needed |

## Test evidence — accurate levels

- **JavaScript V8 in-tool replay:** PASS for synthetic contract tests including duplicate IDs, wrong cycle, missing/publication states, filters, KPI denominator/multi-team, and static HTML/SW integration. This used an in-memory Node API shim, **not** an actual Node process.
- **Local Node on exact PR HEAD:** **NOT RUN on Owner workstation**. Commands above must run before owner calls this LOCAL PASS. JS syntax compilation was checked inside the JavaScript execution environment.
- **Existing IA-2 Node regression:** NOT RUN in a real Node runtime as part of this PR.
- **Browser/iPhone/iPad:** NOT RUN; Owner should record device versions and screenshots.
- **GitHub Actions:** No workflow added. Do not claim PASS from any Pages deployment workflow.
- **Security review:** No public data source or roster published; owner/dataset privacy sign-off pending.
- **Staging:** NOT APPLICABLE for this static-only branch.
- **Production GO / Production Acceptance:** NOT APPROVED / NOT RUN.

## Pre-merge gates and handoff

1. Owner runs two Node suites and JS syntax check on **exact PR SHA**, records Node/OS and output, tests iPhone Safari / iPad / desktop light/dark and original routes.
2. Review `git diff origin/main...HEAD` for intentional IA-3-only files, no private keys/real participant fields, no 73 mutation, no unauthorized runtime fetch.
3. User explicitly authorizes **Merge PR** separately. Merge into `main` may update GitHub Pages automatically and thus is a **public deployment step** to treat as a distinct GO decision as the user's instructions require.
4. After approved deployment, verify Pages live build/version, touch areas, offline/PWA update and cache rollover. Publication of real 74 data requires **another** source/privacy/project PR.

**Suggested next:** IA-3 Source Gate (canonical cluster-stage public aggregate schema + status/quota reconciliation in CompetitionManager), or IA-4 school preparation interface. Never bypass the separate permission gate.
