# NGK-DESKTOP-HOME-02 — Desktop home / task-first summary acceptance

**Date:** 4 November 2026
**Repository:** `infobwd/sillapa`
**Base:** `main` at `d822407832da20251b36bd0c2637f3e36bd0f6f1`
**Scope:** `nongkum.html`, `nongkum-home-desktop.css`, README, test / this acceptance guide.

## Decision
Keep the mobile-first page and its existing data/role routes. On desktop >=1200 CSS px, use a task-first home dashboard with a concise purpose notice, two stacked role choices beside a compact competition calendar, then four overview counts in a single aligned panel. Do not add registration or results features.

## Acceptance criteria

1. Desktop 1366, 1440, and 1920 CSS px: header, purpose notice, role choices, preliminary calendar, four KPI cards, and additional tools align in one common width; no horizontal scrolling. Role choices remain prominent keyboard-usable controls.
2. Dates **15 November 2569** and **3 December 2569** remain the original provisional group dates. Explicitly preserve `ร่างกำหนดการ` and the warning that dates can change; do not make a claim about district competition scheduling.
3. KPI values remain computed from the existing table, **not** duplicated/hardcoded; the four meanings are total rows, rows involving >=2 schools, rows found from one school, and unique schools present in collected records.
4. Remove wording `ผู้สมัคร` from home KPI labels because the website is not a registration service. Keep the registration/results limitation immediately visible on home.
5. On desktop first load, no long list is opened. Clicking a KPI opens a summary; for activity KPIs show **up to five rows** and provide a `ดูทั้งหมด N รายการ` control which opens existing venue view with the correct `all`, `multi`, or `single` status filter. Clicking the selected KPI again collapses the detail.
6. The school-count KPI opens clickable school names that still route to the selected school's existing list. This is a small bounded list rather than an unbounded scroll.
7. Desktop nested scrolling of detail cards is removed. The expansion panel follows the site's OS theme; dark mode must **not** render an oversized white panel. Check accessible focus, contrast and `aria-expanded`.
8. Tablet <1200 px / mobile: existing role cards, calendar, bottom navigation and default multi-school insight behavior are preserved; changing between desktop/tablet widths resets the preview appropriately. No change to competition records, source provenance, private teacher data, school aliases or registration integration.
9. School and venue filtering, back navigation, historical criteria links, CSV/PDF exports and print templates continue to work.
10. Production/GitHub Pages deployment and actual browser/device acceptance require independent evidence. Merge authorization does not mean an approved data release or live-browser acceptance.

## Implementation

- **`nongkum-home-desktop.css`:** separate desktop-only dashboard layout with a task/calendar grid, four aligned KPI cards, lower-density insight drill-down, fixed typography, dark/light palette, reduced-motion support.
- **`nongkum.html`:** additive stylesheet; clearer KPI labels; source-derived preview with 5 rows desktop; native button interactions with `aria-expanded`, context-correct “see all” routing; mobile keeps the old initial expanded behavior.
- **`tests/ngk-desktop-home-02.test.cjs`:** Node tests for structural conditions and mocked KPI interaction/breakpoint cases.

## Reproducible Local-First commands

```bash
node --test tests/ngk-desktop-home-02.test.cjs tests/ngk-desktop-ux.test.cjs
```

Manual acceptance: open `nongkum.html` on Chrome Desktop at 1366×768, 1440×900, 1920×1080, Windows scaling 100/125%, light/dark. Use 1024px tablet and 390/375px phone widths for regression. Click each of four KPI cards, collapse, click "ดูทั้งหมด" on 61/33/28 panels, verify destination counts/filters, use school name links from school count; test all four nav links, print/PDF, CSV, venue category/status filters and keyboard tab order.

## Current evidence and limitations

- Code and selector review verified the scoped styles/labels and the unchanged original source-derived counts.
- A JS syntax compile check and an isolated **mock DOM** execution verified desktop collapse, five-row preview, context-aware multi-school navigation, mobile 33-row default, single-school 28-row preview on mobile and breakpoint switch. This test is **not actual browser acceptance**.
- No local checkout or live browser screenshot was available for this ChatGPT GitHub connector session. Treat device/browser, layout dimensions, print appearance and deployment as **not verified** until tested.
- At task start PR #122 touches teacher-verification documents only; PR #70 touches 3D venue files/tests/docs only. Neither overlaps files proposed here.
