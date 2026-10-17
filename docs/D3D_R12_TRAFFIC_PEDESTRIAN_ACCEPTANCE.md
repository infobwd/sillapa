# D3D-R12 — Traffic and Pedestrian Acceptance

Status: IN PROGRESS — initial vehicle spacing/merge code committed; pedestrian changes and browser acceptance pending.

## Baseline
- Repository: infobwd/sillapa, based on main after D3D-R11 (#69, 8fe2477).
- Scene: `venues/schematic-3d.html`.
- Preserve historic 73 data, registration, existing venue navigation, mobile controls and other venue scenes.

## Verified code review
- `trafficPose` includes rear parking, front parking, Building 1 drop-off and shared highway exit phases.
- `highwayExitPose` maps campus departures onto the eastbound highway connector.
- R11 uses an approximate give-way radius against highway vehicles; this is not collision physics.
- R11 documentation explicitly states WebGL playback and browser acceptance are pending.

## R12 implementation sequence
1. Audit continuous pose and heading at each route phase boundary; correct discontinuities and reverse maneuvers without rotating the vehicle unexpectedly.
2. Verify vehicle spacing at junctions and merging, including vehicles already stopped and highway traffic.
3. Check the blue pickup's full rear-carport entry, dwell, reverse and exit against static cars and columns.
4. Trace pedestrian spawn, walk, queue, arrival and disappearance for dome registration and Building 1; avoid teleportation and crossing traffic lanes.
5. Keep the scene responsive on iPhone, iPad and desktop; no additional remote 3D asset dependency.

## Acceptance criteria
- Multiple complete traffic loops with no overlapping vehicles, wrong-way movements, or abrupt visible teleports.
- East gate traffic yields and joins the correct lane; trucks and buses stay on designated main-road lanes.
- Rear pickup neither clips parked cars nor carport columns and reverses consistently.
- Students walk continuously from drop-off to registration/building destinations without crossing active vehicle lanes.
- Traffic/people/roof toggles, building click-to-focus and mobile detail panel still work.
- Static checks and a real WebGL browser visual pass documented separately. Do not mark PASS before browser acceptance.
- No changes to `history73.json` or scoring and registration logic.

## Implementation log — 17 October 2026
- Updated `venues/schematic-3d.html` in R12 branch to inspect current and candidate internal-vehicle positions and prevent close-gap swaps.
- Added highway give-way check against both current and candidate merge positions.
- Remaining: verify route transitions, pickup clearance, pedestrian flow and browser WebGL playback. These are **not accepted yet**.
