# Sillapa 74 — 3D Venue Development Roadmap (D3D-R14–R20)

Status: PROPOSED / DOCUMENTATION ONLY — 17 October 2026. Owner approval and Local-First acceptance required per phase.

## Purpose and boundaries
Develop `venues/schematic-3d.html` from an illustrative 3D venue scene into a reliable **competition-preparation** and wayfinding demonstration. The Sillapa 74 PWA is **not** the registration or scoring system. All vehicle/student counts and animations are illustrative, not actual attendance or approved traffic instructions. Do not alter 73 historical results, judges, teachers, students, scores, registration, or `AcademicCompetitionManager` data. Do not imply unapproved 74 venue assignments are official.

## Current baseline
- R11 PR #69: initial highway connection and low-poly vehicles.
- R12 PR #71: spacing/merge guard, merged; browser acceptance was not completed.
- R13 PR #72: highway headway and longer dome/Building 1 pedestrian paths, merged; visual acceptance still pending.
- PWA update PR #73: Service Worker cache version and 3D entry URL refresh, merged; user confirmed update works.
- Source of truth for implementation: `venues/schematic-3d.html`; existing 73 venue data remains immutable.

## Prioritized delivery plan

| Phase | Work package | Scope | Exit / acceptance |
| --- | --- | --- | --- |
| 1 | **D3D-R14 — Simulation Stability & Acceptance** | Audit route geometry, lane occupancy, collision/overlap, transitions, highway merge, rear pickup, student visibility; add reproducible simulation test fixtures and observation checklist | >=5 minutes playback, multiple loops, no visible overlaps/teleports, cars yield correctly, students visible; test on real WebGL iPhone Safari, iPad, Chrome desktop; record PASS/FAIL with evidence |
| 1 | **D3D-R15 — Student Journey** | Van/pickup drop-off → dome registration → queue/check-in → Building 1 entrance → stairs → meeting room; staged student groups and staff | Continuous, visible journey with no person through car/building; queue and destinations clear; exact stairs/door positions require approved layout |
| 2 | **D3D-R16 — Traffic & Drop-off Operations** | Separate car/van/pickup/bus/truck behavior; right-of-way, safe stopping/parking and scenario with simultaneous arrivals | No collisions or gridlock over repeated high-traffic runs; lane direction and highway exits correct; operational scenarios labeled illustrative |
| 2 | **D3D-R17 — Registration Dome & Building Interiors** | Registration tables/staff, queue markers, building entrance, stair and meeting room details; level-of-detail rendering | Locations match approved plan, no speculative room labels, interior visible when appropriate and FPS acceptable |
| 3 | **D3D-R18 — Interactive Wayfinding** | Click venue/registration point, follow a route/vehicle/student, show/hide layers, camera presets and reset | Touch/mouse accessible; clear wayfinding, keyboard/focus behavior and back navigation; no false real-time claims |
| 3 | **D3D-R19 — Mobile, Performance & PWA** | Adaptive model density, touch gestures, bottom sheet, reduced-motion option, offline/error handling, update notice regression | iPhone/iPad/desktop checks, usable FPS and no crashes, app update prompt works; offline behavior accurately disclosed |
| 4 | **D3D-R20 — Sillapa 74 Planning Data Integration** | Link 3D venue/building/room to approved preparation metadata, activities and coordinators; data provenance/version and permission review | Only authorized public data shown, source and approval status explicit, 73 history untouched; no registration/results workflow introduced |

## R14 — first PR execution checklist
1. Inventory moving entities and their actual occupied bounding dimensions; distinguish static parked objects and main-road traffic.
2. Replace time-only traffic movement and simple point-distance checks where needed with deterministic lane headway, merge priority, occupancy/segment conflict checks, and no jump at wrap/phase transitions.
3. Instrument student paths: spawn, unload, walk, dome queue, Building 1 entrance, floor transition; flag segments crossing vehicle lanes and verify destination geometry before changing route.
4. Add repeatable local test commands and test observations for normal speed, accelerated loops, high-traffic load and visibility toggles.
5. Run static checks locally (no GitHub Actions quota), then WebGL playback >=5 minutes on Chrome desktop, iPhone Safari/PWA and iPad; capture dated screenshots/video and record PASS/FAIL.
6. Fix observed failures before merge; avoid declaring PASS based on static checks or merged PR alone.

## Delivery gates and governance
- **Design Gate:** check existing venue layout/approved floor plans; label unknown geometry as illustrative and request confirmation.
- **Implementation Gate:** one focused PR per work package; source edits + tests + documentation; do not change 73 historical datasets or competition scoring.
- **Local-First Gate:** run test commands on developer machine in VS Code; do not rely on GitHub Actions while quota is unavailable.
- **Visual Acceptance Gate:** desktop Chrome + iPhone Safari/PWA + iPad, traffic/person toggles, mobile controls, navigation, sustained playback, and screenshots. Mark untested items PENDING, not PASS.
- **Release Gate:** merge only with owner approval; verify GitHub Pages/PWA release and update banner, note version/cache behavior and any known limitations.
- **Data Gate (R20):** approved source, authorization, provenance, privacy and withdrawal/rollback before public display.

## Suggested PR sequence
R14 stability/acceptance → R15 student journey → R16 traffic scenarios → R17 interiors → R18 interaction → R19 mobile/PWA → R20 approved planning-data linkage. Reorder only after recording dependencies and acceptance impacts.

## Non-goals
- No historical results edits, student/teacher/judge record changes, scoring, application intake or official live traffic monitoring.
- No claim that demonstration vehicle counts, routes or unapproved building details reflect real event operations.
