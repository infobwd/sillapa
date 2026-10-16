# D3D-R10 — Parking, road separation, building drop-off and click-to-focus

**Status:** Draft PR. Scene geometry and motions are schematic (not a verified road/traffic model).

## Problems reported
- Vehicles parked sideways or end-to-end inside open-sided car shelters.
- Internal traffic sometimes occupies the same road area; main-road and gate road surfaces overlap visually.
- A vehicle should stop before Building 1 to drop off students wearing recognisable school uniforms.
- Clicking any building should bring the camera directly to it, while preserving the historical details panel.

## Implementation
1. **Road geometry:** Road 3342 stays centred at z=52, width=9 (inner edge z=47.5). Internal driveways stop at this boundary rather than extend onto the public-road surface. A separate stop line is rendered inside each gate.
2. **Parking geometry:** Side carport has two side-by-side bays at x=16.95/19.35, z=3.3; rear carport has three forward-oriented bays at x=-3.4/0/3.4, z=-35. Parking stripe boundaries match the stall layout. Front forecourt parked cars and moving cars align lengthwise with painted bays.
3. **Traffic circulation:** Main road keeps two separate constant-speed lanes. Internal vehicles now remain entirely behind the gate (z<=45.8), circulate via the left entry and right exit and disappear briefly after leaving, before the next entry. The former rear road circuit no longer drives onto Road 3342. An internal-road safe-gap mechanism checks each next candidate point against other visible moving internal cars and pauses when within 3.25 scene units. This reduces vehicle mesh overlaps, but is **not** a full collision-avoidance/priority road-safety engine.
4. **Forecourt parking manoeuvres:** Two vehicles follow separate curves to distinct bays; each fully stops, unloads, reverses straight out and joins the outbound lane. Passenger disappearances occur after walking/standing in a waiting spot.
5. **Building 1 student drop-off:** A dedicated vehicle stops on the transverse internal road (at approximately x=5.5,z=22), with a labelled curb on the building-facing side (z<20). Four illustrative pupils wearing white tops, dark blue shorts/skirts, socks, shoes and small bags step off to the curb, walk to the lawn and then fade. These are **not** real students or actual participant counts.
6. **Building focus:** Every dynamically created building stores its world centre. Clicking a building's mesh, its on-map tag, or its name in the building list animates the camera and OrbitControls target to that building (0.52s). Manual orbiting cancels the transition. Top view and reset still work. On phones, the model details bottom sheet is shorter to keep the focused building visible.

## Source-level validation already run
- The module JavaScript parser accepts the modified script (imports excluded during parsing).
- Analytic checks for highway separation, parking stall extents, focus hooks and interpolation paths.
- A 600-second simplified polyline traffic model with an equivalent 3.25-unit safe-gap rule found a minimum 3.2500-unit gap and repeated cycles without internal-car centre overlaps. **This uses polyline approximations, not a full Three.js WebGL playback.**

## Acceptance tests to run on a desktop and mobile browser
1. Open `venues/schematic-3d.html?venue=kanchanaburi-pesa4` and check both garage shelters: vehicles are wholly within each stall and not across the lines.
2. Watch at least 3 complete parking cycles. Check entry-to-bay turning, stationary unload, reverse, and exit. Verify cars do not visually overlap at intersections or under shelters.
3. Look down from top view to confirm the public road/gate surfaces meet at their edge, with no z-fighting or double-layer road strips. Public buses/cars must not clip the internal cars at both gates.
4. Watch a Building 1 drop-off cycle: one vehicle stops in front of the building; uniformed pupils unload on the building side, walk and only then fade.
5. Tap/click every building and each building button. Ensure the camera zooms to that actual building, not the page centre. Check roof toggle and reset view after focusing.
6. On an iPhone/PWA verify the selected building stays visible above the compact detail sheet; ensure performance remains acceptable.
7. Switch to Anuban Bophloi and back; check click-to-focus is still correct and traffic controls are still disabled for the non-district scene.
8. Verify clickable building details, venue badges, labels and historical data remain unchanged.

No change to `history73.json`, competition results, teacher/student identities or scoring.
