# D3D-R18 — Interactive Wayfinding (Schematic 3D)

**Status:** CODE IMPLEMENTED / OWNER VISUAL ACCEPTANCE PENDING — 17 October 2026

## Purpose and authority

Continue the locked [D3D-R14–R20 development roadmap](D3D_R14_R20_DEVELOPMENT_ROADMAP.md), following merged R17B (#83). The three-dimensional visualization remains an **illustrative Sillapa 74 venue preparation tool**. The coordinates are not surveyed, the walking paths have not been field-checked for safety/accessibility, and this feature is **not** a real-world navigation service, verified emergency route, GPS/live traffic system, official registration tool or scoring tool.

Historical competition data from **ครั้งที่ 73** is still read-only and is used separately to explain the building's past competition activities. **Do not present these labels as approved room assignments for ครั้งที่ 74.**

## R18 feature inventory

### 1. Five explicit schematic start/destination choices

The district office venue (`kanchanaburi-pesa4`) has a labelled, accessible **🧭 เส้นทางเดิน (จำลอง)** toolbar with these choices:

| Stop ID | Display label | Approximate world (X,Z,Y) |
|---|---|---|
| `dropoff` | จุดลงรถ (ทางเท้า) | (7, 16.52, 0) |
| `registration` | โดมลงทะเบียน (จำลอง) | (4.407, -5.75, 0) |
| `building1` | อาคาร 1 (ทางเข้า) | (5.15, 10.8, 0) |
| `building2` | อาคาร 2 (จุดหน้าอาคาร) | (6.35, -11.5, 0) |
| `meeting2` | ห้องประชุมชั้น 2 (จำลอง) | (2.70, 9.75, 2.6) |

For **โรงเรียนอนุบาลบ่อพลอย**, the controls are disabled with a clear "ยังไม่มีผังเส้นทางเดินที่ตรวจสอบแล้ว" message. The system must **not** invent a campus route in that venue.

### 2. Safe schematic pedestrian graph

New pure module `venues/wayfinding-r18.mjs`:
- Uses an explicit connected graph of the previously illustrated **east-side protected pedestrian shoulder** and dome check-in aisle from R17B. The branch to Building 1 follows the existing stair/corridor cue; the branch to Building 2 ends outside the building facade.
- `planWayfindingRoute(from,to)` finds the lowest scene-distance path on these **approved-for-the-illustration only** edges (bidirectional graph; no shortcut across vehicle-only strip or restrooms). Routes are available among every pair of the five stops.
- `sampleWayfindingRoute(points,progress)` gives the moving follower position (including the schematic floor elevation).
- `buildingWayfindingStop(label)` maps clickable building labels to the supported destinations and rejects unsupported historical rows.
- `wayfindingHash` and `parseWayfindingHash` limit URL fragments to known, safe stop IDs.
- Graph length is **scene units only**: no estimated walking time, real metre conversion, verified travel distance, safety or accessibility claim is displayed.

### 3. Visible Three.js path and camera presets

In `venues/schematic-3d.html`:
- Draws an **aqua dashed walking line**, forward arrows, start/finish rings, destination label and moving yellow guide marker.
- Adds small 3D destination pins that can be tapped/clicked; existing **building click/list and scene label buttons** also set the selected destination while preserving the previous historical-detail view.
- Toolbar buttons:
  - **แสดงเส้นทาง**: show a new selected route and fit the camera to it
  - **🗺 ภาพรวม**: refit the camera to the current route
  - **▶ ติดตามเส้นทาง**: animate a guide marker and following camera, then stop at the illustrated destination
  - **🚐 ติดตามรถตู้**: follow the existing Building 1 van; traffic must be switched on
  - **🙈 ซ่อนเส้น / 👁 แสดงเส้น**: independent route layer visibility
  - **✕ ปิดเส้นทาง**: close the overlay and return keyboard focus
- Existing **▣ บน, ↺ reset, zoom ±, 🏠 roof, 👥 people and 🚗 traffic** controls continue working. Manual orbit/zoom cancels automatic follow, but does not silently destroy the selected route.
- R17B **👣 ดูนักเรียน** retains precedence; starting the student demonstration stops R18 camera follow and temporarily hides its overlay; stopping restores the route layer according to its previous visibility selection.
- Selecting the **room on floor 2** clearly advises using the existing roof toggle to inspect its illustrative interior.
- Route start/destination fields use associated labels, buttons indicate pressed state, route updates are announced via a live status field, and keyboard users can use Tab, Enter and **Escape**.

### 4. Back navigation and lifecycle

- A selected route is kept in a validated URL fragment such as `#wayfinding=dropoff:registration` so **browser Back / Forward** restores or closes routes without leaving the PWA or altering the existing `?venue=...` query.
- Route materials, line geometries and canvas-texture labels are disposed when a route is changed or the scene is redrawn. Switching venues removes the old route and disables unsupported controls; switching back to the district view restores the valid route from the fragment.
- No private data, registration values, coordinates of real attendees, or server/API write operations are introduced.

### 5. PWA update

- `sw.js` cache version: **`sillapa-public-v25-3d-r18-20261017`**
- Precache `./venues/wayfinding-r18.mjs` alongside the existing R16–R17 route and vehicle scripts.
- Both venue 3D URLs in `index.html` are versioned `&v=r18`.
- External Three.js CDN and the initial scene/data fetch still depend on a network connection; cached helper scripts do not guarantee full offline 3D use.

## Local-First test procedure

No GitHub Actions (quota restriction). From the repository root on Node.js 22+:

```powershell
node --test tests/d3d-r16-traffic-parking.test.mjs tests/d3d-r16b-vehicles-parking-paths.test.mjs tests/d3d-r16c-exit-merge.test.mjs tests/d3d-r16d-inbound-flags-road-labels.test.mjs tests/d3d-r17-dropoff-registration.test.mjs tests/d3d-r17a-dropoff-departure.test.mjs tests/d3d-r17b-dropoff-safe-journey.test.mjs tests/d3d-r17b-traffic-replay.test.mjs tests/d3d-r18-wayfinding.test.mjs
```

New `tests/d3d-r18-wayfinding.test.mjs` includes:
- All 25 ordered route pairs (five choices including same-stop cases) and reverse-distance consistency;
- Waypoint checks against the R17B vehicle exclusion and the Building 1 / dome restroom rectangles;
- Protected alighting sidewalk and R17B registration/Building 1 upper-stair alignment;
- Building 2 external stopping point, point interpolation and simulated floor-level elevation;
- Rejection of invalid labels and hostile URL fragments;
- Presence of accessible toolbar, route rendering/markers, browser history, keyboard, route layer and camera/vehicle follow;
- Second-venue fallback, R17B student-tour compatibility, PWA cache and venue-link version.

**Developer check in this chat:** all nine checked-in JavaScript suites were run using a V8 in-chat harness, **58 PASS / 0 FAIL**, and the scene module script passed a JavaScript parser smoke check. This is **not** a direct `node --test` or graphical WebGL test; local Node and browser acceptance remain pending.

## Browser / owner acceptance — PENDING

- [ ] Chrome desktop: select drop-off → registration; route follows the east-side walkway and no line visibly crosses the van bay, active internal road, toilet or dome seating.
- [ ] Repeat with registration → Building 1 and registration → Building 2; confirm route end markers are outside facade collisions. Select Building 1 → second-floor meeting room; open roof to inspect destination/stair cue.
- [ ] Click buildings, the small pins, the building-list buttons and label buttons. All must choose the expected destination; historical activity details still correctly identify **ครั้งที่ 73**.
- [ ] Use **▶ ติดตามเส้นทาง** and **🚐 ติดตามรถตู้** for at least one whole vehicle loop; following cancels when the user drags to orbit or presses a camera preset, without freezing camera/traffic.
- [ ] Test **🙈 ซ่อนเส้น / 👁 แสดงเส้น**, zoom, top view, overview, reset, roof, people and traffic toggles; confirm guide layers are independent.
- [ ] Test Tab/Enter/Escape, focus-visible styles and screen-reader announcements; press browser Back and Forward to restore/clear routes.
- [ ] Start **👣 ดูนักเรียน** while a route is shown. Confirm student tour takes precedence and the route layer is restored on exit, with no camera tug-of-war.
- [ ] Switch to school venue and confirm wayfinding is disabled with an explanatory message rather than drawing imaginary paths; switch back and restore a valid district route.
- [ ] Repeat on iPhone Safari installed PWA and iPad; check legibility, touch targets, bottom controls, overlay stacking and performance.
- [ ] After deployment, check the PWA update prompt, both `v=r18` URLs, cache v25 and JavaScript console; record device/date/screenshots and result.

**Do not mark the R18 production visual acceptance PASS until the real-device checks and owner review have been completed.**

## Next phase boundary

R19 remains the separate **Mobile, Performance & PWA** work package (adaptive detail density, touch/bottom-sheet polish, reduced motion, offline error handling). R20 remains separate **Sillapa 74 planning-data integration**, subject to permission and provenance checks. No scope change is made to official 73 records or competition results.
