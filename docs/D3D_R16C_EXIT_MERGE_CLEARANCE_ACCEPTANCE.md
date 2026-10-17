# D3D-R16C — Exit Gate Merge Clearance Hotfix

**Status:** CODE COMPLETE / REAL WEBGL & OWNER ACCEPTANCE PENDING (17 October 2026).

## Owner-reported bug

A screenshot supplied after PR #78 showed a **white vehicle leaving the right-hand gate overlapping blue highway traffic at Road 3342**. The vehicle could protrude past the give-way line while still waiting; once the car began merging, the highway follower only accounted for its center after it reached the lane, leaving a period where the turning body was not protected.

This is a focused regression fix to R16/R16B traffic, **not** the next R17 dome/interior phase.

## Root causes and changes

1. **Stop line too close to the highway.** Old departure paths and shared exit curve met at Z=45.8, while the road's inner edge is Z=47.5. The 4.4-unit modern van can project its front ≈2.2 units beyond its center. With a center stopped at 45.8, its nose could protrude to Z≈48.0. **New stop line Z=43.8**, leaving ≈1.5 units to the public road edge after allowing for van length. All three internal departure routes now finish at 43.8; the shared exit curve starts there; its visual stop-line road marking moves upstream. Do **not** move the internal entry lane's stop marking.
2. **Right-of-way was rechecked partway through a turn.** `canEnterMainRoad` now asks for an eastbound gap only while transitioning from the internal lane to the exit curve. Rearward clearance 13 units and ahead clearance 9 units around the merge gateway X≈15.5 are checked. Once committed, the exiting vehicle proceeds through the turn without waiting on traffic again.
3. **Following highway cars tracked the turn too late.** The eastbound lane now treats a *committed* exiting vehicle as an occupied moving merge region from the beginning of the turn (center near X=13,Z=43.8), rather than only after the center reached Z≥48.6. Uncommitted cars **are not** counted; priority stays with the public road before commitment.
4. **Two exiting cars could queue too closely.** In the exit corridor, point-to-point headway now uses the approximate sum of vehicle half-lengths +1 unit; other internal intersections retain their previous 3.6-unit guard.

Affected source:
- `venues/schematic-3d.html` — exit poses, upstream marking, merging-region occupancy, local queue clearance.
- `venues/traffic-r16.mjs` — one-time right-of-way gap reservation and following behavior.
- **No changes** to historical Sillapa 73 data, Sillapa 74 registration/scoring, venue geometry outside traffic, or low-poly vehicle models.

## Local-First automated tests

Run from repo root with Node 22+:

```sh
node --test tests/d3d-r16-traffic-parking.test.mjs tests/d3d-r16b-vehicles-parking-paths.test.mjs tests/d3d-r16c-exit-merge.test.mjs
```

- R16C tests assert upstream physical clearance for the longest internal van, yield before commitment, uninterrupted continuation after commitment, lane occupancy from turn start, multiple merges in a 360-second simulation, and PWA cache/version.
- Prior R16/R16B tests were updated **only** to reflect the new stop/commit semantics and R16C cache version; previous parking/walker and vehicle-model invariants remain.
- The checked-in suite was executed using an in-chat V8 JavaScript harness on 17 October 2026: **16 PASS, 0 FAIL**. Syntax smoke check of the main scene script passed. This is **not** a local Node CLI or full browser/WebGL run.
- GitHub Actions quota is not used, per Local-First repository governance.

## Visual acceptance still required

- [ ] On desktop Chrome, run the venue WebGL for at least **5 minutes**, zoom to the *right-hand exit* and watch several cars, a long van and a pickup use the same exit while road traffic circulates.
- [ ] A waiting internal vehicle must be **fully clear** of the public road pavement/traffic; cars must stop before the exit give-way mark.
- [ ] The highway bus and ten-wheel trucks continue without indefinite deadlock; cars already committed to exiting must finish their turn.
- [ ] No overlapping vehicle bodies at the junction or nose-to-tail contact in the exit queue, including offscreen wrap/re-entry.
- [ ] Toggle traffic/people, switch both venue views, zoom/reset/top view and verify console shows no new errors.
- [ ] Repeat checks on iPhone Safari/PWA and iPad; verify the app prompts to update and fresh assets load.
- [ ] Record date, device, reproducible observations and screenshots before marking Acceptance PASS.

## PWA version

- `sw.js`: `sillapa-public-v20-3d-r16c-20261017`.
- Both `index.html` links to the 3D schematic: `v=r16c`.
- Existing precached `traffic-r16.mjs` and `vehicle-models-r16b.mjs` remain included; the Service Worker update invalidates previous caches.

**Important:** Code merge does not certify collision-free real-site traffic. Vehicles, dimensions and motion are still schematic illustrations, not an approved traffic plan.
