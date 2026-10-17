# D3D-R19B — Vehicle Deadlock Hotfix (17 October 2026)

**In PR. Real browser/WebGL and owner acceptance: PENDING.**

## Reproduction and fix

Owner screenshot: blue pickup and white van become motionless at the Building 1 drop-off crossing. In the R17B six-minute replay's **linear curve substitutes**, variants `[0,.55,.39,.69]` and `[.51,.48,.464,.77]` left multiple cars frozen for over 170 seconds in a three-minute run.

- Move both departing front-bay car lanes from Z=22 to Z=25.2 and turn north at [13,29], physically separating through-traffic from the stopped van at [7,18.55].
- Widen existing asphalt **north only**, from Z=20..24 to Z=20..27.5. Keep incoming van approach, protected pupil curb, dome registration and building geometry unchanged.
- Reserve the shared front/rear/van junction for one vehicle at a time. Already-committed cars clear before the van, or the van claims the vacant junction before departing. New cars hold upstream (front X=-5.6 / rear Z=8.5); all existing oriented-body and swept collision checks stay enabled. No forced unsafe release or teleports.
- Cache new `venues/junction-r19b.mjs` and bump public PWA v28; direct scene links use `v=r19b`.
- No change to Sillapa 73 history, students, teachers, judges, scores, or official Sillapa 74 registration.

## Checks and evidence

In-chat V8 simulation using the source scene's extracted movement functions (not real Three.js splines) replayed 240 seconds for **five** phase arrangements, including both freezes above. All cars kept circulating, no checked full-body overlap in the monitored intersection, and no observed pause ≥55 seconds. This does **not** replace `node --test` on the PC or real Chrome/iOS WebGL acceptance.

On a local checkout of the PR branch with Node 22+, run:

```powershell
node --test tests/d3d-r16*.test.mjs tests/d3d-r17*.test.mjs tests/d3d-r18*.test.mjs tests/d3d-r19*.test.mjs
```

## Acceptance gate — not yet verified

- [ ] Desktop Chrome ≥5-minute actual WebGL replay of 4 campus cars + 10 highway cars; inspect sedan/van/pickup turn on widened asphalt, lane directions, traffic stop/restart and visible overlap
- [ ] iPhone Safari/PWA + iPad landscape/portrait: 3D rendering, controls, traffic and student tour, wayfinding, roof and people toggles work with no UI overlap
- [ ] R19 quality/reduced motion/pause/resume/fallback checks remain PASS on devices
- [ ] PWA v28 update prompt works and both links show `v=r19b`; no stale v27 render
- [ ] Actual local Node tests PASS (exact SHA, date, logs); verify in Chrome + iOS before owner Merge/GO
- [ ] Record screenshots/video, any real-world layout discrepancies, and rollback procedure

The depicted traffic is illustrative; it is not verified guidance for physical vehicle operations. D3D-R20 stays a separate data-approval phase.
