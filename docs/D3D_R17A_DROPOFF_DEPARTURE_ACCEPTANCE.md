# D3D-R17A — Drop-off Departure Release / Stuck Vehicle Hotfix

**Status: IMPLEMENTED IN PR / REAL WEBGL ACCEPTANCE PENDING — 17 October 2026**

## Owner issue

After R17 merged (PR #81), the owner supplied a screenshot showing a white van beside a blue pickup near Building 1's simulated drop-off zone, reporting: **“รถส่งเสร็จแล้วไม่ยอมไป”** (after dropping students off, vehicles would not leave).

This is a focused R17A corrective follow-up. It does **not** begin R18 and does not change Sillapa 73 history, Sillapa 74 registration or scoring.

## Root causes found in R17

1. The white van arrived at normalized progress `q=.38` and was forced to **remain parked until `q=.59`** at a speed of `.009`: approximately **23.3 seconds stationary**. The front-bay cars also spent over 20 seconds parked before backing out. During normal playback this looks like an indefinitely stuck drop-off, even before an actual collision occurs.
2. The old exit from the van bay ran via `[9.2,19.15] → [10,22]`, cutting across the eastbound pickup/sedan through lane at Z≈22. A stopped or passing car could obstruct the van just as it began turning out.
3. The R17 oriented-body check correctly blocked new unsafe overlap, but could also freeze vehicles **already** within a footprint clearance threshold. Even a candidate motion increasing clearance would be rejected until a fully clear pose magically appeared. This creates mutual-wait scenarios after a crowded arrival.

## Implemented code

### Short, explicit unloading timetable

In `venues/dropoff-r17.mjs`:

| Vehicle | Arrive phase end | Stationary unloading | Next action |
|---|---:|---|---|
| Building 1 white van | `q=.38` | until `q=.465` = about **9.4 simulated seconds** | leave curbside bay via dedicated east pull-out |
| Front-bay car/pickup | `q=.29` | until `q=.39` = **10.0 seconds** | reverse by `q=.47`, then follow original exit path |

The fourth van passenger starts unloading at `q=.434`, **before** departure starts at `q=.465`. Passengers continue their existing visible journey to the dome / Building 1; check-in timelines remain unchanged.

### Curbside van exit avoids through lane

The white van departs from `[7,18.55]` eastward along **Z=18.55** to `[11.35,18.55]`, then toward the **east side road X≈13**, where it turns north via Z=23.7→29→38→43.8 and continues to the existing highway merge. The former diagonal route intersecting the pickup crossing at X≈10,Z≈22 is removed.

The bay, sign, pedestrian step-off, dome desks, queue markers, people and roof controls are unchanged.

### Safe release from existing close spacing

- New `vehicleFootprintMargin` and `vehicleOverlapDepth` measure body-oriented clearance and remaining overlap.
- New `shouldHoldDropoffRelease` continues to block **new** incursions and **moves closer** to another vehicle.
- For a white van **already in its departure phase**, an already-close pair may make a small motion **only when both total overlap penetration decreases AND the actual center distance increases**. This is a narrow, monotonic recovery rule to release cars from a stalemate; it is *not* a blanket collision override.
- Where the current R17 non-bay point-gap rule applies, a similarly narrow departure-only allowance lets the van move **away from** an already too-close car.
- Highway entry still yields through R16C and R16D rules; cars **may still wait briefly for real traffic gaps**. No forced teleport, removal, or indefinite timeout override was added.

## Local-First automated checks

From the repository root with Node.js 22+:

```powershell
node --test tests/d3d-r16-traffic-parking.test.mjs tests/d3d-r16b-vehicles-parking-paths.test.mjs tests/d3d-r16c-exit-merge.test.mjs tests/d3d-r16d-inbound-flags-road-labels.test.mjs tests/d3d-r17-dropoff-registration.test.mjs tests/d3d-r17a-dropoff-departure.test.mjs
```

New R17A tests check:
- Short dwell and post-unloading phase entry for both van and pickup;
- Dedicated eastward pull-out before joining the eastern side road;
- Close approaching vehicles yield rather than collide;
- Departing vans reduce existing overlap until separated rather than freezing;
- A crossing pickup eventually clears and the waiting van can continue;
- Previous inbound/outbound highway rules and student registration handoff remain;
- Both PWA venue shortcut links use the refreshed version.

**In-chat JavaScript/V8 check:** the six checked-in test files were re-executed against the GitHub branch content on 17 October 2026: **37 passed, 0 failed**. Scene script syntax smoke test **PASS**. This is **not** a locally executed Node CLI command or live WebGL playback; no GitHub Actions were used.

## Real browser acceptance: NOT YET PASS

- [ ] Chrome desktop WebGL, ≥5 minutes: observe the white van arrive, unload all four student figures, leave within about 10 seconds of becoming stationary (unless actual traffic blocks exit), travel east from the bay and north along the east-side road.
- [ ] Observe the blue pickup and front-lot vehicles unload, reverse and exit. A van and pickup may wait for one another at a junction, but should **not remain frozen for more than one normal passing cycle**.
- [ ] Observe multiple vehicle cycles with cars arriving during the previous van's exit; verify no vehicle body overlap and no abrupt jump while a car moves away.
- [ ] Verify previously fixed R16C outbound highway merge still yields and eastbound buses continue.
- [ ] Check no van uses the former diagonal cross-lane segment at X≈10,Z≈22.
- [ ] People/Traffic toggles, roof toggle, student path to dome, registration queues, and auditorium continue to display.
- [ ] iPhone Safari/PWA + iPad: check speed, zoom/orbit, updated scene scripts and no errors.
- [ ] After the new GitHub Pages deployment, observe PWA update prompt and verify Service Worker cache `sillapa-public-v23-3d-r17a-20261017` and two `v=r17a` 3D URLs.
- [ ] Record device/browser/date, screenshot/video evidence and explicit PASS/FAIL before full production acceptance.

## PWA

- `sw.js`: `sillapa-public-v23-3d-r17a-20261017`, invalidates the previous R17 cache; the `dropoff-r17.mjs` helper remains included in the PWA cache list.
- `index.html`: both 3D venue shortcuts updated to `&v=r17a`.
- The site still uses an illustrative 3D traffic simulation, **not** a traffic-safety-approved or live registration system.
