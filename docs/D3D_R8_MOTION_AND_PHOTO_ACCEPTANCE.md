# D3D-R8 — Pedestrian safety, dome reference and frontage flag

Status: proposed implementation (draft PR). Do not treat this as a surveyed campus plan.

## Reference observations supplied by owner (16 October 2026)
- Dome interior: dark steel/arched roof, columns, terracotta floor, a welcome presentation with bright floral artwork and tree-shaped green decorative elements; seated event audience in the reference photo.
- Road-facing forecourt: tall Thai flagpole **behind** the frontage monument/sign when approached from the major road; multiple smaller flags nearby.
- Photos are visual references, not measured coordinates or event-specific crowd data.

## Changes
1. Stop teleporting pedestrians between the ends of a route: reflect on the path, interpolate segment-by-segment and keep separate lateral lanes.
2. Keep walking routes outside simulated vehicle lanes, forecourt drop-off and rear cross-road. Use small stylized crowds rather than suggesting real headcounts.
3. Unloading characters appear on the curb away from their vehicle, walk to a safe waiting point and fade out **after** reaching it, not during a walk.
4. Represent the dome with dark structural ribs, floor markings, welcoming banner, two stylized green tree props and empty seating. Retain the existing stage position unless a surveyed plan confirms a change.
5. Model Thai flag and short decorative flags behind road frontage sign, leaving separate entry and exit corridors unobstructed.

## Manual acceptance checklist (not yet run)
- Desktop and mobile: open `venues/schematic-3d.html?venue=kanchanaburi-pesa4`; inspect from default camera and top view.
- Watch at least two drop-off cycles: no pedestrian vanishes mid-stride; curb traffic and pedestrians stay separated.
- Watch walkers traverse both ends of each path: no teleport, cuts through offices or cross-vehicle movement.
- Verify parked vehicles and two entrance/exit lanes remain free of added flag structures.
- Confirm flagpole is behind roadside sign relative to Highway 3342; dome banner faces the viewer and isn't blocked by backdrop.
- Switch to `anuban-bophloi`: no regression, and unsupported vehicle controls remain disabled.
- Test traffic/person/roof toggles, venue selection and building click-to-details in light and dark themes.
- If realistic collision-free vehicle-to-vehicle behavior is required beyond visually separated routes, implement a dedicated traffic/collision simulation, not implicit 3D mesh physics.

## Data boundaries
- Do not modify `history73.json`; team, attendance and vehicle counts are not supplied.
- The 3D scene remains schematic, not a real-time navigation map or confirmed competition timetable.
