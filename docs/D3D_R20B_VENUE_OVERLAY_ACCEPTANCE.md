# D3D-R20B — Venue Status Overlay Acceptance

**Implementation PR · real Chrome/iPhone/iPad WebGL acceptance PENDING · 18 October 2026**

## Purpose

Source-labelled information layers for the public Sillapa 74 **preparation** 3D viewer. The displayed counts come solely from historical event **73** rows, and service points belong to an **unverified illustrative** district campus model. Neither the school map nor official round-74 venue readiness has been approved.

## Implementation

- `venues/overlay-r20b.mjs`: pure layer state defaults, whitelist normalization, historical building grouping, and explicit district-only illustrative service markers. No official event-74 source, status values or participant totals.
- Three independently selectable checkboxes in a responsive disclosure: `ป้ายชื่ออาคาร`, `จำนวนกิจกรรมย้อนหลัง 73`, `จุดบริการในผังจำลอง`. The third is **OFF by default** to avoid visual crowding. Preferences are saved only in local browser storage, with safe fallback if unavailable.
- Labels toggle existing canvas sprites; historical counts toggle existing edition-73 competition sprites and shortcuts. Historical lists remain readable even if 3D badges are hidden.
- Five schematic-only 3D point labels for the District Office model: check-in dome, student drop-off sidewalk, toilet, front parking, rear parking. Every marker states **(จำลอง)**; models and POI coordinates are not a real-world map or accessible path. For Anuban Bophloi no POIs are added; when requested, text explains there are no supported coordinates.
- Source notice shows exact activity-row and normalized building counts for historical edition 73 and explicitly says no verified edition-74 readiness. No "ready / busy / alert" badges, occupancy, real traffic, scoring, judge assignment or PII.
- DOM-only controls do not interfere with 3D click meshes. POIs have their own Three.js group, visibility property, and parent disposed with the venue scene. Existing keyboard focus, 44px controls, model sheet and reduced-motion modes remain in place.
- PWA cache key `sillapa-public-v30-3d-r20b-20261018`, helper precache and both main entry links `v=r20b`.

## Strict non-goals

Do not change D3D-R19B junction logic/vehicle dimensions/speeds, student wayfinding, historic 73 results, any source database, registered teams, judges, teachers, students, scores, or the formal 74 registration system. The originally planned D3D-R20 **approved-data linkage** is a separate publication and access-control gate and is not part of R20B.

## LOCAL_FIRST test instructions

On a clean checkout of the PR SHA with Node 22+:

```powershell
node --test
```

New `tests/d3d-r20b-venue-overlay.test.mjs` checks defaults, invalid stored preferences, counts, POI source restriction, wiring, persistence, R19B/R17B/R18 guards, and PWA cache. Existing R16–R20A regression suites were version-bumped. In-chat V8/static tests do **not** constitute a real `node --test` run or GPU visual sign-off.

## Real-device and release acceptance — PENDING

- [ ] Chrome desktop: independently toggle nameplates, historic badges and service points; restore preferences across reload, changing venue and switching quality
- [ ] Phone Safari 320/375/390/430px and iPad: disclosure initially collapsed, checkbox hit area ≥44px, status text legible, no overlap with student controls or building bottom sheet
- [ ] The district's five POIs float above the intended **schematic** components and are clearly marked `จำลอง`. Avoid hiding building or room names; choose OFF to declutter
- [ ] Anuban Bophloi: no guessed POIs. Status output explains this limitation. Historic counts still match its dataset
- [ ] All old 73 count tags, 3D badges and original lists correspond to current `history73.json`; no readiness 74 data or live user/student data appears
- [ ] Real Three.js/WebGL playback ≥5 minutes with van, pickup and public road vehicles: no body overlap/deadlock; tour path (van → dome → Building 1 upper-floor) and R18 route interactions still work
- [ ] Performance low/auto/high, dark/light shell, accessibility, hidden/resumed page, v29 → v30 PWA update prompt and transparent offline failure remain acceptable
- [ ] Record screenshots/videos from desktop/iOS, commit SHA, date and actual local Node output; request explicit owner Merge approval before release

Owner Merge is separate from real-device acceptance and deployment verification.

## R20B1 JavaScript initialization hotfix (18 October 2026)

Owner screenshot: `Uncaught ReferenceError: Cannot access 'venueLayerDisclosure' before initialization`, `syncVenueLayerDisclosure`, scene module line 210. Root cause: module called the mobile disclosure synchronizer at line 210 before the `const venueLayerDisclosure` DOM binding at line 215. R20B1 moves the one binding ahead of all synchronizer calls and adds an executable Node `vm` regression that verifies mobile initial collapse and viewport-change callbacks. PWA cache v31 and both entry links `v=r20b1` invalidate stale viewer references. Real browser/PWA visual acceptance still PENDING; original R20B historical source, 74 data permissions, vehicles and student routing remain unchanged.
