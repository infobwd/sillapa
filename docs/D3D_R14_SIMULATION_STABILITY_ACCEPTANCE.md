# D3D-R14 — Simulation Stability & Acceptance

Status: IMPLEMENTATION IN PROGRESS / WEBGL ACCEPTANCE PENDING (17 October 2026)

## Baseline
R13 (#72) and PWA update (#73) merged. R14–R20 roadmap merged via #74. Scene: `venues/schematic-3d.html`.

## Changes in this PR
- Highway vehicles use a consistent per-frame snapshot of simulation progress rather than reading mutable Three.js model positions during the same update.
- Same-lane spacing is calculated using circular progress so the route wrap does not lose headway.
- Each vehicle's advance is bounded by the space ahead; campus merging vehicles are checked before committing road positions.
- No change to venue data, competition results, registrations or historical 73 datasets.

## Important remaining risks
- Internal vehicles still use approximate point-radius and candidate-pose guards; this is **not** a swept-body collision solver.
- Passenger groups spawned beside drop-off vehicles still disappear before completing a true continuous journey. R15 owns full dome → Building 1 → upstairs routing; R14 must still confirm current pedestrian visibility and crossing safety.
- Mixed vehicle body lengths, highway wrap, and long-duration traffic queues require real visual checks.
- This PR does not claim full R14 acceptance.

## Local-First acceptance checklist
- [ ] Run local syntax/static checks on scene JavaScript.
- [ ] Chrome desktop: 5+ minutes of WebGL playback; inspect both highway lanes and merge junction from top and oblique views.
- [ ] Confirm no road-vehicle overlap, abrupt teleport inside visible road, or wrong-way driving over several loops.
- [ ] Check pickup backing/parking against stationary cars and columns.
- [ ] Confirm walkers remain visible on dome and Building 1 approach and do not cross active lanes.
- [ ] Test traffic/people/roof toggles and building focus.
- [ ] iPhone Safari/PWA: 5+ minutes and update notice regression.
- [ ] iPad: camera gestures, touch controls, 5+ minutes.
- [ ] Record screenshots/video, device/browser/date, actual PASS/FAIL and follow-up defects.

## Release rule
Do not mark R14 PASS or claim production visual verification until actual WebGL playback is recorded. Merge only with owner approval after local checks.
