# D3D-R15 — Student Journey Acceptance

Status: IMPLEMENTED IN BRANCH / REAL WEBGL ACCEPTANCE PENDING — 17 October 2026

## Implemented
- Replace short-lived passenger spawn/fade with continuous, deterministic waypoint interpolation tied to each vehicle's route progress.
- Front-bay student groups travel along an illustrative western pedestrian path to the registration dome and remain visible at the destination until the simulation loop resets.
- Building-drop-off van passengers follow the building-side shoulder to Building 1's indicative entrance, with a vertical visual cue for upstairs access.
- Students are staggered per vehicle; existing traffic/people visibility controls remain authoritative.
- No modification to 73 history, scoring, registration or published competition schedules.

## Limitations / must not overclaim
- This is a visual route demonstration, not a validated accessible pedestrian route or measured building plan.
- Registration desks, queueing/official check-in behavior, surveyed stairs and the meeting-room interior are **not** implemented in this PR.
- The group resets with the vehicle simulation cycle; no independent pedestrian state machine or collision avoidance against other walkers is provided.
- Verify approach paths against the actual approved site plan before calling them safe or official.

## Local-First checks before acceptance
- [ ] Chrome desktop: follow a complete van-to-Building-1 route and a front-bay-to-dome route at least twice; no premature disappearance or jumping.
- [ ] Confirm student paths do not visibly cut through buildings, parked cars or moving traffic; adjust waypoints where required.
- [ ] Check Building 1 upstairs cue only when correct floor geometry is visible; compare against approved building plan.
- [ ] Toggle people and traffic independently, switch venues, then switch back; ensure no lingering models.
- [ ] iPhone Safari/PWA and iPad: watch the route in close and top views, confirm touch gestures and performance.
- [ ] Verify PWA update notice and fresh R15 URL after GitHub Pages deploy.
- [ ] Record browser/device/date, screenshots and PASS/FAIL; do not mark complete without visual acceptance.

## Next
After route acceptance, implement genuine dome check-in/queue and approved Building 1 stairs/meeting-room path as a follow-up, rather than inventing unverified geometry.
