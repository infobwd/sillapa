# Sillapa 74 — IA-1 Homepage & Navigation Acceptance

> **Work package:** IA-1 only · **Status:** IMPLEMENTED IN FEATURE BRANCH; LOCAL DEVICE ACCEPTANCE PENDING  
> **Repository:** `infobwd/sillapa` · **Branch:** `feat/ia1-home-navigation`  
> **Design basis:** [IA & Data Contract](SILLAPA74_INFORMATION_ARCHITECTURE_DATA_CONTRACT_DESIGN_LOCK.md) and [Roadmap](SILLAPA74_INFORMATION_ARCHITECTURE_ROADMAP.md)  
> **Merge and Production:** NOT APPROVED until Owner confirms the PR separately

## 1. Scope and actual implementation

This work is limited to the **static public planning hub's information architecture and homepage**. It does **not** introduce an official Competition-74 activity approval system, backend data sync, registry write APIs, registration, results, score, venue allocation, judge confirmation, or PII storage.

1. **Preparation-first homepage:** brand hero, two actionable entry points, provenance/“not results system” explanation, **count of draft activity families dynamically from `NXI.length`**, three **unknown (—)** official readiness KPIs, task preparation links and existing shared schedule. Historic medal charts and shortcuts are retained but placed below the forward-looking content and explicitly marked as **73 historical information**.
2. **Six proposed target destinations (on desktop):** ภาพรวมเตรียมงาน 74 (`overview`), รายการแข่งขัน 74 (`next`), เตรียมแข่งขันของโรงเรียน (`prep`), ความพร้อมผู้จัดและกลุ่มเครือข่าย (`readiness`), กรรมการและสนามแข่งขัน (`venue`), คลังข้อมูลย้อนหลัง 70 / 73 (`archive`). Existing `next` remains the original 73 ↔ draft-74 comparison logic; the current IA-1 label is a destination for preparation, not an assertion that official 74 registry exists.
3. **Phone/iPad portrait:** bottom navigation has **exactly four visible options**: ภาพรวม / รายการ 74 / โรงเรียน / เพิ่มเติม. The More sheet gives access to the remaining three target destinations, historic drill-down routes, school picker and data export. The full six are accessible on landscape iPad/desktop rail. CSS labels adapt to orientation changes without reloading.
4. **Legacy views preserved**: `overview`, `reps`, `groups`, `schools`, `acts`, `judges`, `next`, `prep`. New views are `readiness`, `venue`, `archive`. All previous hash deep-links (`#reps`, `#groups`, etc.) still resolve to their old content; parent navigation highlights the proper new section.
5. **Readiness and venue** deliberately show **unknown (—) with explanation**, not fabricated numbers. Historic judge references remain the 73 view; no "รายชื่อทำเกียรติบัตร" action restored.
6. **PWA preserved:** Splash, per-section skeletons (now 11 views), pull-to-refresh, install banner, updates and local school plans. New stylesheet `ia1.css` added to `sw.js` precache with bumped `sillapa-public-v3-ia1-20261015`.

## 2. Local-First checklist in VS Code

From the Sillapa project root:

~~~powershell
git fetch origin
git switch feat/ia1-home-navigation
git pull origin feat/ia1-home-navigation
python -m http.server 8000
~~~

Open `http://localhost:8000/` and inspect Browser DevTools Console/Network:

| Test | Acceptance requirement |
| --- | --- |
| IA1-01 | App boots, Splash closes, no JavaScript errors or persistent Skeleton. All **11 views** render when reached. |
| IA1-02 | Homepage starts with clear "prepare Competition 74" purpose, draft count uses the draft source, confirmed KPI remains “—”, not zero; no false live registration counts. |
| IA1-03 | Calendar correctly distinguishes **4 Dec 2026 deadline for cluster representative data** and **21–24 Dec 2026 tentative district competition**; unknown registration dates remain unknown. |
| IA1-04 | Desktop >=1024 CSS px: six destinations visible and clickable, with correct `aria-current`. Clicking each shows its expected view. |
| IA1-05 | Mobile <768 CSS px: four buttons, including More. No overlapping icons, right-edge overflow or missing thumb-target at iPhone safe area. |
| IA1-06 | iPad 768–1023 CSS px: four bottom buttons and correct main content width, no leftover left-rail margin. Rotate to >=1024: six sidebar destinations appear, labels change correctly without reload. |
| IA1-07 | More opens a reachable sheet with routes for organizer, judges/venues, archive and existing history; choosing one closes sheet and navigates. Dismiss with close button and scrim; keyboard focus behavior intact. |
| IA1-08 | Every old deep link `#overview/#reps/#groups/#schools/#acts/#judges/#next/#prep` works after a fresh reload and back/forward `hashchange`. Parent nav highlights "archive" for reps/groups/schools/acts, and "venue" for judges. |
| IA1-09 | Original round-73 statistics, judges, CSV exports and round-70 **25 mapped families / 63 reference variants** all remain readable/searchable, including two flagged unresolved families. |
| IA1-10 | Teacher's selected school and local plan (`plan74`) survive browsing, refresh, reload, SW update and switching 6 sections; **no automatic registration/write**. |
| IA1-11 | PWA install/standalone mode, Splash/Skeleton, pull-to-refresh and offline after initial load. `ia1.css` is present in Cache Storage. Cached data display historic/version disclaimer. |
| IA1-12 | Test narrow iPhone SE, standard iPhone, iPad portrait/landscape and desktop, dark/light, reduced motion, touch scrolling. No private team data or 74 results reported by the information hub. |

For mobile testing use the GitHub Pages HTTPS deployment **only after merge and successful Pages deployment**. Localhost from a different device over HTTP may not meet Service Worker secure-context requirements.

## 3. Repeatable static checks (assistant-run vs owner-run)

The assistant should check the actual GitHub PR branch SHA and source (not just assume feature success):

- JS syntax of all embedded inline scripts and referenced PWA scripts; manifest parse.
- 11 `view` sections, all 8 historic IDs unchanged, no duplicate IDs for new sections, expected bottom nav CSS breakpoints and parent route mappings.
- Service worker includes `ia1.css`, new cache name and existing catalog/pull-refresh/PWA assets.
- Git compare shows only `index.html`, `ia1.css`, `sw.js`, README and this checklist.
- **Human-real-device installation, interactive navigation and visual testing: NOT RUN** by assistant unless actual browser device evidence is acquired. Do not label device acceptance PASS from static parsing.

## 4. Release and rollback

- No GitHub Actions test workflow; follow `infobwd/repo-governance` LOCAL_FIRST.
- This implementation PR is independent of the docs-only PR #5. The docs’ **PROPOSED** status for public data contract remains; feature implementation does **not** authorize publishing a read-only feed or live counts.
- Merge only on explicit Owner instruction. Check Pages deploy SHA for `main` and source/Service Worker freshness before claiming live. Browser refresh may show an offline cached snapshot.
- Rollback the IA-1 UI PR if broken and **bump/update the Service Worker** when necessary to supersede previously installed caches, rather than assuming Git revert alone removes an active Service Worker.
- Source of truth for entries, certificates, score, sensitive judge data and stage policies stays in `infobwd/AcademicCompetitionManager` with separate Production 73 protection.

## 5. Next work package

**IA-2:** refine the Competition-74 activity registry into family → child event → grade/type, with crosswalk provenance, approval state and explicit historical 70/73 context. IA-2 must not assert that the historically sourced 63 variants are approved as official Kanchanaburi-4 Competition 74 entries without organizer authorization.
