# D3D-R11 — Highway merge, low-poly pickup, rear Building 2 parking

Status: implementation proposed in Draft PR; browser visual acceptance still pending.

## User request and constraints
- Cars **leaving the district compound** must drive out the east gate and merge onto the actual visual segment of the major road, rather than disappear at the gate.
- Use the user-provided **blue low-poly pickup image** as a visual reference. The PNG is a rendered image, not a Three.js mesh/GLB. The code constructs a procedural faceted blue double-cab pickup (hood, windshield, windows, crew cab, open bed, grille, bumper, headlights, tires, mirrors); this is **not an exact image-derived mesh**.
- Behind the single-storey Building 2 extension, keep a **covered car parking area**. Use the third marked rear carport bay dynamically: a blue pickup enters from the rear cross-road, parks, pauses, reverses, turns out, then departs by the eastern gate and takes the main road.
- Preserve 73 historic competition data and all existing UI/scene controls.

## Route design
- Highway 3342: road surface z=47.5..56.5, eastbound traffic center z=49.25.
- Internal east gate exits at (13, 45.8). All 4 moving campus vehicles share an eastbound connector:
  (13,45.8) -> (13,47.4) -> (15.5,49.25) -> (27,49.25) -> (49,49.25).
- Vehicles on the connector use a **give-way distance check** against traffic already on the main road and share the established internal minimum-distance check. Once clear they continue eastbound and leave the simulated field of view, then reset to the campus entrance for another illustrative cycle. They do not reverse at the gate or jump onto the highway centre.
- Existing highway car/bus flow remains in both lanes; all are schematic, not live traffic or real vehicle counts.
- Rear parking bay centre x=3.4,z=-35 is cleared of static cars. The remaining two slots x=-3.4 and 0 remain occupied. New access/apron joins the carport with the rear transverse roadway z=-27.

## Manual acceptance to run on deployed app
1. Watch vehicles complete multiple outbound journeys: each exits the right gate, turns onto the **eastbound highway lane**, travels some distance on the highway, then leaves the rendered area.
2. From overhead view inspect gate/road continuity and traffic merging; pay special attention to vehicles waiting at the connector and collision/priority behavior. Dynamic path-following is **not a full collision-physics system**.
3. Confirm blue pickup shares styling with the reference low-poly double-cab pickup, with bed and wheels clearly visible; do not assert pixel-exactness.
4. Watch a whole rear-carport cycle: pickup enters rightmost free bay behind Building 2, holds, reverses without turning in place, joins rear cross-road, exits at the east gate and enters highway lane.
5. Ensure parked cars and the new moving pickup do not visually clip shelter columns or each other.
6. Confirm traffic and people toggles, roof toggle, click-to-focus and building detail panels still work on desktop and phone.
7. Confirm venue Anuban Bophloi is unchanged and no additional 3D asset downloads were added.

## Verification performed
- JavaScript module syntax parse succeeded (imports excluded for standalone parser).
- Static route presence and parking availability checks passed.
- **WebGL scene rendering and full real-time vehicle path playback remain unverified**.

No modifications to `history73.json`, published results, or registration workflows.
