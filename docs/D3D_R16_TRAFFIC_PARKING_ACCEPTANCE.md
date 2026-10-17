# D3D-R16 — Traffic, Pedestrian Sign Bypass & Parking Acceptance

Status: IMPLEMENTED IN BRANCH / REAL WEBGL AND OWNER ACCEPTANCE PENDING — 17 October 2026

## Evidence and defects
Owner screenshots received 17 October 2026 show: (1) road traffic/bus paused on the public road, (2) students and ambient walkers crossing the Building 1 sign, (3) side canopy parking direction requiring change, and (4) Building 2 extension lacking adjacent car spaces.

## Implementation
1. **Highway right-of-way:** moved standalone lane movement to `venues/traffic-r16.mjs` for local-only regression tests. Public-road cars no longer yield to vehicles at the gate; exit vehicles yield until committed, then become moving ahead-vehicles that the highway follows with circular 10-unit minimum headway. Both directions use immutable current-frame progress.
2. **Building 1 sign:** actual sign geometry spans X approximately -5.65..5.65, Z about 12.6. Both independent ambient walkers and van drop-off students now take a narrow X approximately 6.1 eastern bypass. Avoid lateral wandering through the sign; respect the adjacent pavilion boundary at X approximately 6.475. This is schematic positioning, not a surveyed pedestrian-accessibility route.
3. **Side canopy by Building 1:** reorient the two parking cars 90 degrees toward the driveway; stripe parking slots across Z instead of X, keeping the canopy and internal road unchanged.
4. **Building 2 rear extension:** add an attached two-car canopy against its east wall (X about 5.4, Z about -17); the existing detached rear parking canopy is retained. New roof does not cover the eastern internal road (whose western edge starts at X=10.5).
5. **PWA:** version `sillapa-public-v18-3d-r16-20261017`, both venue links version `r16`, and pre-cache the new traffic helper. Fix SW JavaScript/CSS matching to include `.mjs` and normal `.js`.

## Tests
Run locally (Node.js 22 recommended, without GitHub Actions):

```bash
node --test tests/d3d-r16-traffic-parking.test.mjs
```

The checked-in tests cover 300-second deterministic traffic simulation with east/west lanes; full-circle minimum headway; bus progress after merge; highway priority versus queued exit; following a committed exiting vehicle; and geometric guard checks against sign, pavilion, extension wall and road edge.

**Status of checks:**
- [x] Pure traffic helper was exercised in an independent 360-second in-chat V8 simulation; headway, merge priority and committed-exit follow cases satisfied.
- [ ] Run the *checked-in* Node.js test command on the development machine and save its result; CI / GitHub Actions deliberately unused.
- [ ] Run full Three.js browser scene for at least 5 minutes with traffic enabled and observe both bus directions and repeated gate exits.
- [ ] View Building 1 front entrance from both overhead and oblique cameras: nobody crosses the sign or pavilion.
- [ ] View side canopy: two cars face west into marked bays and do not obstruct internal road.
- [ ] View attached Building 2 canopy: two parked cars, new roof touches extension, no intrusion into pavilion or road.
- [ ] Verify all car/people/roof toggles, camera controls, venue switch and return.
- [ ] Verify deployed PWA update prompt, correct R16 3D asset and no stale cached R15 page on iPhone Safari/PWA, iPad and desktop Chrome.
- [ ] Record screenshots/video, device/browser, date and PASS/FAIL; retain failures for follow-up.

## Limits and governance
- This change fixes the specific owner-observed gridlock mechanism. It does not establish collision-free behavior at every interior junction or proof of physical traffic safety.
- Traffic count, vehicle type, placement, parking and pedestrian movement are illustrative; not official site guidance.
- Historic Sillapa 73 competition data and all entry/scoring workflows are unchanged.
- **Do not label production acceptance PASS based on a merged PR or source-only checks.** Merge after owner approval; visual acceptance remains explicitly pending.
