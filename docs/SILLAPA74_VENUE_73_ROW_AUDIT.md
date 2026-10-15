# Sillapa 74 — 73 venue reference row audit (2026-10-15)

**Source:** `infobwd/AcademicCompetitionManager@feat/v74-2-venue-reconciliation-20261015`, review-only JSON. No Production DB writes or official 74 venue approval.

| Metric | Anuban Bophloi | District Office |
|---|---:|---:|
| Declared and actual source rows | 53 | 45 |
| Missing room label | 28 | 15 |
| Missing floor label | 28 | 41 |
| Missing time | 0 | 1 |

## Raw building group counts
Anuban: อาคารอนุบาล 2 (1), อาคารอนุบาล 3 (1), อาคาร 6 (5), ห้องสมุดใหม่ (1), อาคาร 5 (9), อาคาร 4 (5), โรงอาหาร (10), อาคารโดม (4), อาคาร 3 (6), อาคารอเนกประสงค์ (11).

District: อาคาร1 (13), อาคาร 1 (4), อาคาร2 (13), อาคารโดม (15).

Counts represent **schedule rows**, not physical rooms, unique activities or verified buildings. Some `building_raw` values (e.g. ห้องสมุดใหม่) may actually refer to a room or facility and need owner review. Normalizing `อาคาร1` and `อาคาร 1` may be appropriate as a display alias only; preserve raw source strings.

## Preview script audit
`tools/venues/v74_2_preview.py` validates `row_count` and produces matched/unmatched/ambiguous/duplicate_review classifications against a supplied `activity_id,name` CSV. **Without the CSV, no successful activity-ID matches can be claimed.** Do not interpret unmatched as invalid activity.

## Gate to interactive 3D
1. Owner verifies source rows and duplicates against PDFs.
2. Isolated 74 activity CSV enables preview of ID reconciliation; review ambiguous entries.
3. Produce sanitized public-only 73 historical snapshot with source provenance and no PII.
4. Verify actual building footprints/positions with campus managers and authorized maps/photos.
5. Render campus-specific Three.js and mobile 2D fallback; keep 73 history visually distinct from confirmed 74 schedule.

No runtime site data or live 3D building geometry is published by this audit.
