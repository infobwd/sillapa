# D3D-R16D — Highway Inbound Approach, Fluttering Flags & Road 3342 Markings

**Status: IMPLEMENTED IN BRANCH / LIVE WEBGL ACCEPTANCE PENDING (17 October 2026).**

## Owner instruction

Instead of appearing unexpectedly at the gate, vehicles entering the district office must visibly approach from the **public highway and turn into the left entry gate**. Other small welcome flags should flutter like the national flag. Show the highway name on the asphalt and label the **right-hand direction: ไปอู่ทอง →**, **left-hand direction: ← บ่อพลอย**.

This is an R16 traffic/scene follow-up, **not** R17 dome registration and building-interior work.

## Scene implementation

### Entrance approach and traffic priority

- `venues/schematic-3d.html` now assigns an `entryCurve` to every internal moving vehicle, starting on the public-road **eastbound lane**: world X=-65, Z=49.25 → X=-17, Z=49.25 → west entry gate X=-13, Z≈45.8.
- The first `0.15` of an inbound vehicle's normalized simulation cycle follows the entry curve; the rest reuses its existing `arrive` route to its parking/drop-off destination. Arrival poses are now shared by the front-bay cars, van to Building 1 and rear-carport pickup. This preserves the existing unloading, walking and outbound behavior.
- New `canAdvanceInboundRoad` helper in `venues/traffic-r16.mjs` enforces **highway priority** and longitudinal safe gaps: inbound cars wait when another car is close to where they enter the highway, then follow cars ahead. Existing road traffic behind sees an inbound car as a moving lane occupant until it has cleared the gate turn.
- Inbound cars currently approach from the **left side of the image, eastbound lane**. A separate westbound/right-to-left arrival requiring a safe turn across the opposite lane was **not** added; no claim of fully surveyed traffic operations.
- Widened the drawn Road 3342 to X=-70..70 so inbound cars have pavement under their approach; the cyclic main-road fleet runs over a **154-unit track** and is visible only where |X|<68, ensuring wrap-around takes place offscreen instead of abruptly on the drawn road.
- The existing R16C **outbound stop line Z=43.8**, one-time gap reservation, and vehicle body-length clearance remain in place.

### Road labels and directions

Road-surface `CanvasTexture` labels, horizontal to the asphalt:
- Left-hand road segment (X=-31, Z=54.75): **← บ่อพลอย**
- Right-hand road segment (X=31, Z=49.25): **ไปอู่ทอง →**
- Center segment (X=0, Z=52): **ถนนหมายเลข 3342**

Paint is illustrative and not a validated legal road-sign installation. The road number follows the existing scene source's `road3342` identifier and the directional destinations follow the owner-provided instruction.

### Fluttering other flags

- The four small coloured welcome pennants at X=-6, -4.5, +4.5, +6 are now subdivided `.72 × .47` planar cloth meshes with `12 × 4` geometry segments.
- They are inserted into the same `flagCloths` animation collection as the Thai national flag. Wave amplitude, cloth width and phase are individual to each flag; the attached edge stays fixed and the free end moves.
- Canvas-based road-marking textures are disposed when the scene is reset or switched, avoiding repeated GPU allocations across redraws.

### PWA update

- `sw.js` cache: **`sillapa-public-v21-3d-r16d-20261017`**
- The two venue entry URLs in `index.html`: **`v=r16d`**
- Existing `.mjs` modules remain in the Service Worker cache shell, fetched network-first when online. Three.js external CDN still requires connectivity for first-time access.

## Local-First test instructions

Run with local Node 22+ from the repo root (GitHub Actions are intentionally unused):

```bash
node --test tests/d3d-r16-traffic-parking.test.mjs tests/d3d-r16b-vehicles-parking-paths.test.mjs tests/d3d-r16c-exit-merge.test.mjs tests/d3d-r16d-inbound-flags-road-labels.test.mjs
```

Automated coverage includes:
- Valid inbound path waypoints and actual stage transitions of all three arrival types;
- Inbound yielding to eastbound road traffic ahead/behind at initial entry, moving behind traffic afterwards;
- Highway following a committed inbound road user without deadlock, and 360-second repeated arrival simulation while preserving lane headway;
- All four pennants participating in the shared wind solver;
- Road name, direction arrows, correct positions and asphalt rendering;
- PWA cache and versioned venue URLs;
- All older R16, R16B and R16C traffic, restroom, parking, student-sign bypass and model regressions.

**Observed in-chat V8 test execution**: 23 cases PASS / 0 FAIL on 17 October 2026; scene script syntax PASS. These tests were evaluated against the checked-in code in a JavaScript harness; they were **not** run via Node CLI on a local machine or in a browser.

## Visual acceptance still required

- [ ] Chrome desktop: load the correct venue and observe at least **5 minutes** of traffic. Cars should approach from the highway's **left side** on actual asphalt, turn through the **left entrance** and proceed to their destinations, never simply spawn at the gate.
- [ ] Verify road-car/bus priority; any inbound car yielding or following highway cars must avoid overlaps.
- [ ] Verify R16C outbound vehicles still stop before the public road and never overlap highway traffic.
- [ ] Visually inspect the small coloured flags: each waves along its length and is attached to its pole; Thai national stripes stay synchronized.
- [ ] Top/oblique camera: confirm the Thai labels appear **on the actual roadway** and arrows point in the owner's specified screen directions. Adjust texture text orientation if a particular device renders it mirrored.
- [ ] Verify no car drives on the green field and no car teleports along the visible highway at track wrap.
- [ ] Test camera reset/zoom, roof toggle, traffic/people toggles, venue switches, and legibility on iPhone Safari/PWA and iPad.
- [ ] Verify PWA update notice, new R16D URL, fresh cache and lack of JavaScript console errors.
- [ ] Record real-device date, screenshot/video, actual PASS/FAIL and follow-up defects **before** declaring production visual acceptance.

## Data boundaries

All building positions, traffic, visual flags and roadway labels are illustrative. The app remains an **Sillapa 74 preparation and information tool**, not a live traffic routing service or the Sillapa 74 registration or score system. Historical Sillapa 73 results, participants, judges, committees and competition records are unchanged.
