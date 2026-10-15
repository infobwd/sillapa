# Sillapa 74 — Mobile Navigation and Historical Archive UX Acceptance

**Date:** 15 October 2026  
**Repository:** infobwd/sillapa  
**Change:** Overview 74 first; six old 73 shortcuts relocated to More → Archive; roadmap and README reconciled with merged IA PRs  
**Gate:** Draft code PR only, LOCAL_FIRST. No inferred owner acceptance, production validation, API integration or automatic Merge.

## Scope / decisions

1. The home page retains the 74 preparation hero, official unknown indicators, draft-only indicator, three preparation actions and tentative calendar above the 73 reference block.
2. A compact 73 summary reports **actual filtered historical entries, schools and activities**, using the same old row set as the chart. It is marked historical, never an official 74 KPI.
3. The old full 73 KPIs, waffle chart, ranking, and source-linked drilldowns remain in the DOM behind a native accessible `details` disclosure. They are not deleted or used as a 74 result.
4. The **exact six shortcuts** (reps, groups, schools, activities, judges, export) move from the overview into `#archive`, with explicit 73 labels. The archive retains the 70 reference route. From the mobile bottom bar, More → Archive is a direct one-step action; More also retains quick links to history and export.
5. The mobile and iPad bottom bar remains **4 controls**: Overview, 74 Events, School, More. Desktop remains six sections. `#reps`, `#groups`, `#schools`, `#acts`, `#judges`, `#archive`, `#next` and `#executive` remain valid routes. Historical judges highlight the Archive destination.
6. Additional scroll clearance accounts for fixed bottom navigation and iPhone safe-area inset. No new APIs, credentials, private data or localStorage keys.
7. Service Worker cache becomes `sillapa-public-v11-ia6-20261015` because index and ia1.css changed. The old assets remain part of the offline shell.

## LOCAL_FIRST command matrix

Run on the exact **PR HEAD**, not an unrelated local branch:

```powershell
git fetch origin
git switch --detach origin/fix/overview-archive-nav-roadmap-20261015
git rev-parse HEAD
git status --short
node tests/navigation-archive-ux.test.cjs
node tests/developer-attribution.test.cjs
node tests/ui-plain-thai-copy.test.cjs
node tests/ia2-registry.test.cjs
node tests/ia3-readiness.test.cjs
node tests/ia4-school-workspace.test.cjs
node tests/ia5-judge-venue.test.cjs
node tests/ia6-executive.test.cjs
git diff --check origin/main...HEAD
python -m http.server 8000
```

Open `http://localhost:8000/#overview` and verify the top 74 cards, then scroll to 73 (only 3 compact numbers), expand/collapse all original charts, use More → Archive → six buttons including Export, confirm 70 reference entry, and test all deep links from old bookmarks.

**Device manual acceptance:** iPhone Safari (including installed PWA), iPad/tablet, Chrome desktop; portrait/landscape and dark/light. Check bottom bar does not cover the last scrollable controls; export sheet closes safely; fonts and labels wrap within three-column Archive tiles; keyboard navigation works for summary and actions; navigate away/back; test offline with an updated SW, not a simulated stale cache.

**Data safety:** Round 73 frozen; Round 70 source only; Round 74 draft remains separate from approved; unknown official KPIs stay `—`; no creation/update of canonical registration, roster, judges or venue sources; existing local-only school/judge plans left intact.

**Current evidence:** static source/invariant inspection performed when drafting the PR. **No owner-device Node test, browser layout test, CI PASS, GitHub Pages/Production confirmation or real-data acceptance claimed.** Owner to review, test exact HEAD and explicitly approve Merge; any real 74 feed/publication requires a separate source/privacy/data reconciliation gate.
