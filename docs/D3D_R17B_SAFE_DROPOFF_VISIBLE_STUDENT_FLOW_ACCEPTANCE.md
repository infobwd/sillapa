# D3D-R17B — Safe Student Drop-off, Follower Collision Guard & Visible Journey

**Status: IMPLEMENTED IN BRANCH / LOCAL NODE + REAL WEBGL ACCEPTANCE PENDING (17 October 2026)**

## Owner evidence

Two owner screenshots of R17A after merge show:
1. Trees/shrubs placed in the student van drop-off / protective pedestrian strip;
2. People appearing within a place where moving vans/cars could run over them;
3. A following blue pickup approaching dangerously close to the white van leaving the drop-off;
4. Student sequence **รถ → โดมลงทะเบียน → อาคาร 1 → ห้องประชุมชั้น 2** was not visible or easy to follow.

The source-of-truth is the latest `main` after merged PR #82. This is a visual **Sillapa 74 preparation** scene, not an approved campus traffic or student-safety route.

## Corrections

### A. Remove vegetation and protect pupils

- Original forecourt vegetation in `decorateDistrict()` placed two green shrubs at approximately **(5.1,18.4)** and **(8.5,18.4)**, overlapping the new vehicle-only bay. R17B removes *those two shrubs only*; it preserves other garden shrubs and the entrance landscaping.
- Right lawn strip now ends before the bay. A distinct protected sidewalk and low yellow curb are shown, with two small safety posts placed outside the van stop.
- Vehicle-only polygon: approximately **X=3.0..10.35, Z=17.24..24.45**. Natural pupils from the white van appear at **Z=16.52**, on the protected southern sidewalk. Background walkers on the Building 1 route start at approximately **(6.12,16.42)**, not the old unsafe **(5.5,19)**.
- `venues/dropoff-r17.mjs` centralizes `PEDESTRIAN_EXCLUSION`, `inVehicleOnlyArea` and `fromVanToRegistrationWaypoints`. The new R17B tests sample every waypoint segment to assert no pupil route crosses the vehicle-only zone.

### B. Prevent white van / following pickup contact without deadlocks

- Introduce `shouldHoldFollowerAtDropoff` to stop an approaching front-bay car **before the junction** when the van is committed to its departure. Cars already in the junction continue to clear it, while the van yields when needed.
- Introduce `shouldHoldVehicleCorridor`, using interpolated/swept oriented vehicle rectangles along the connecting road instead of only a center-point gap. It checks possible contact during a movement step.
- Allow escape when vehicles were **already** inside each other's safety envelope *only if* every permitted step reduces overlap and increases center separation. Never allow a new collision or motion deeper into another vehicle.
- Revert the white van's **initial simulated phase** from the R17B trial `0.31` back to `0.73`: starting the van immediately behind the second parking car was reproducibly causing both cars to yield to one another. Students can still be viewed **immediately** via the independent guided-tour control below.
- Preserve R17A short dwell and east-side exit, R16C outbound highway merge, R16D inbound entry, road 3342 and reference vehicles.

### C. Make the complete pupil journey actually visible

- White van pupils now follow the same full sequence as the front-bay pupils: **protected sidewalk → dome reception queue → Building 1 stair / illustrative upper meeting corridor**. Previously the van pupils skipped registration and headed directly to Building 1.
- Add the actual UI button **👣 ดูนักเรียน**. It starts a **46-second** independent, camera-followed sequence immediately — no wait for the long highway/vehicle progress loop.
- The guided view shows three larger animated student figures, a dotted/light-colored 3D route line, location signs, camera follow, and an on-screen stage indicator:
  1. Safely alight on the sidewalk
  2. Walk to the dome
  3. Pause at the registration desk
  4. Walk into Building 1 and rise to floor 2
  5. Arrive at an **illustrative** meeting-room destination
- For visibility the dome roof is automatically hidden during the tour and its earlier roof state restored when the tour stops. A user can stop the tour with **⏹ หยุดติดตาม**, by manual drag/orbit, or by switching off the people layer. The guided tour only runs in the district venue, not the other school scene.
- This is a presentation layer using schematic coordinates, not a live passenger tracking feature; students, desk activity and room locations are illustrative.

### D. PWA and tests

- `sw.js`: **`sillapa-public-v24-3d-r17b-20261017`**.
- Both venue links in `index.html`: **`&v=r17b`**. The existing `dropoff-r17.mjs` file remains in the Service Worker cache shell and is refreshed by the new version.
- Added `tests/d3d-r17b-dropoff-safe-journey.test.mjs` and `tests/d3d-r17b-traffic-replay.test.mjs`. Updated old R16/R17A assertions for the safe Building 1 reroute and PWA cache version, without removing legacy traffic safety coverage.
- **Critical regression caught during implementation:** broad body-envelope checks plus an early white-van initial phase caused a new indefinite multi-car deadlock even though one-off vehicle tests passed. Reverting the initial phase and retaining ordered conflict guards resolved that replay failure.

### Local-First check (Node 22+, no GitHub Actions)

From the repository root:

```powershell
node --test tests/d3d-r16-traffic-parking.test.mjs tests/d3d-r16b-vehicles-parking-paths.test.mjs tests/d3d-r16c-exit-merge.test.mjs tests/d3d-r16d-inbound-flags-road-labels.test.mjs tests/d3d-r17-dropoff-registration.test.mjs tests/d3d-r17a-dropoff-departure.test.mjs tests/d3d-r17b-dropoff-safe-journey.test.mjs tests/d3d-r17b-traffic-replay.test.mjs
```

**In-chat JavaScript V8 verification:** pending final recorded test total. The replay extracts actual `trafficPose` / `animateDistrictVehicles` functions from the current HTML and substitutes approximate *piecewise linear* curves for Three.js splines. It runs **360 simulated seconds**, 4 moving campus vehicles and 10 highway cars, checks that each campus vehicle loops and that oriented physical vehicle bodies never overlap in the internal conflict corridor. The replay is **not the exact Catmull-Rom/WebGL renderer** and may miss graphics-only issues.

## Real-device WebGL acceptance — NOT YET PASS

- [ ] In Chrome desktop, load the district scene and inspect the bay close-up. **No shrub/trunk or safety post inside the marked van bay**, and the right lawn ends before the van's wheels.
- [ ] Observe actual walking students and background figures; **no pedestrian appears on the vehicle-only zone**, including unloading, queuing, trip to the dome, and walking onward.
- [ ] Watch the blue pickup behind the exiting white van for ≥5 minutes; there must be **no visual overlap or rear-end contact**, and no cars frozen indefinitely at the shared junction.
- [ ] Click **👣 ดูนักเรียน**: the first visible group starts on the sidewalk immediately, camera follows a complete **46s** demo, with a clear six-second registration pause and Building 1 upstairs destination.
- [ ] Check that real moving van passengers ALSO reach the dome desk before Building 1, rather than going directly upstairs.
- [ ] Confirm dome roof opens during the tour and resets on exit; test **⏹ หยุดติดตาม**, manual camera drag, People/Traffic toggles, mobile controls and venue switching.
- [ ] Chrome desktop, iPad and iPhone Safari/PWA: test text/markers readability, smooth animation, performance, accessibility labels and no JavaScript errors.
- [ ] Verify PWA update prompt and cache v24 after GitHub Pages deployment; confirm both `r17b` venue links.
- [ ] Record device/date/screenshots and actual PASS/FAIL in this file before declaring production acceptance.

## Unchanged governance

No changes to Sillapa 73 historical competition results, students, teachers, judges or committee data, Sillapa 74 official registration/scoring systems, or approved site routing. No GitHub Actions used; owner approval required before merge.
