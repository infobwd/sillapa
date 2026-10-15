# D3D-1 — District Office layout skeleton acceptance

**Status:** implementation candidate; visual owner review pending. Branch `feat/d3d-1-district-layout-skeleton-20261015`.

## Provisional layout (Three.js local units, not surveyed meters)
- Z -58..58: long narrow plot (width 42); external road 3342 at Z +52.
- Rear pond around Z -46; grouped offices and dome around Z -12.
- Broad front paved yard centered Z +15; entrance around Z +43.
- Side boundaries, farmland strips and schematic trees; no Google imagery used as texture.
- Office/dome labels and historical 73 competition click-through preserved.

## Deferred until D3D-2..4
- Accurate office roof footprints, dome dimensions, detailed gate/parking/landscaping.
- Existing student walkers are provisional. Bus routes are not yet rebuilt against the new layout and need D3D-4 before being re-enabled.
- Satellite screenshot only establishes approximate zone order; no georeferenced coordinates or official navigational claims.

## Acceptance checklist
- [ ] Local JS syntax check and browser load.
- [ ] Top-down view confirms rear pond → clustered roofs → broad front yard → road 3342.
- [ ] No mesh overlap between roads and roofs; test mobile camera/reset.
- [ ] Tap each district building to view historical 73 activities.
- [ ] iPhone Safari manual test; verify navigation menu and Thai labels.
- [ ] Venue owner approves relative layout before D3D-2.

No Production 73 data modified; GitHub Actions not relied on.
