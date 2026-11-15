# CareCircle Design System

> Extracted from Google Stitch — CareCircle Elderly Care Platform

## Source Snapshot

- Stitch project ID: `4529599254818582115`
- Screens: 16 (all DESIGN screens, DESKTOP)
- Canvas width: 2560px; individual canvas heights are recorded in `manifest.json`.
- Export date: 2026-11-15

## Shared Assets

- `assets/elder-profile.jpg` contains the shared Papa portrait referenced by 13 screens.
- The CareCircle logo image is hosted at a Googleusercontent URL that redirects to sign-in during download, so it is not included as a local asset. Extracted screen HTML retains the original image references.

---

## Font Family

All text uses **Atkinson Hyperlegible Next** — chosen for maximum legibility for elderly users.

| Role | Family |
|---|---|
| Headline | Atkinson Hyperlegible Next |
| Body | Atkinson Hyperlegible Next |
| Label | Atkinson Hyperlegible Next |

---

## Typography Scale

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `headline-xl` | 40px | 700 | 52px | Page hero titles (desktop) |
| `headline-xl-mobile` | 32px | 700 | 42px | Page hero titles (mobile) |
| `headline-lg` | 32px | 700 | 44px | Section headings |
| `headline-lg-mobile` | 26px | 700 | 36px | Section headings (mobile) |
| `title-card` | 22px | 700 | 32px | Card titles |
| `title-medication` | 24px | 700 | 34px | Medicine name on detail / list cards |
| `body-regular` | 20px | 400 | 32px | Body text, instructions |
| `body-bold` | 20px | 700 | 32px | Emphasis in body copy |
| `label-button` | 22px | 700 | 28px | Button labels |
| `label-status` | 20px | 700 | 26px | Status chips (Taken / Missed / Upcoming) |

---

## Color Palette

### Primary (Blue)
| Token | Hex | Role |
|---|---|---|
| `primary` | `#00446b` | Interactive elements, links |
| `primary-container` | `#0f5c8c` | Primary button background |
| `on-primary` | `#ffffff` | Text on primary |
| `on-primary-container` | `#a5d3ff` | Text on primary container |
| `primary-fixed` | `#cde5ff` | Subtle tinted backgrounds |
| `primary-fixed-dim` | `#94ccff` | Hover / pressed |
| `inverse-primary` | `#94ccff` | Primary on dark surfaces |
| `on-primary-fixed` | `#001d32` | Text on fixed primary fills |
| `on-primary-fixed-variant` | `#004a75` | Secondary text on fixed primary fills |

### Secondary (Green / Taken)
| Token | Hex | Role |
|---|---|---|
| `secondary` | `#006e2e` | Secondary actions, success |
| `secondary-container` | `#98f8a5` | "Taken" chip background |
| `on-secondary-container` | `#067432` | Text inside "Taken" chip |
| `secondary-fixed` | `#98f8a5` | Fixed green fill |
| `secondary-fixed-dim` | `#7cdb8b` | Hover on secondary |
| `on-secondary-fixed` | `#002109` | Text on fixed secondary fills |
| `on-secondary-fixed-variant` | `#005321` | Secondary text on fixed secondary fills |

### Tertiary (Orange / Missed)
| Token | Hex | Role |
|---|---|---|
| `tertiary` | `#732900` | "Missed" status, urgent alerts |
| `tertiary-container` | `#993900` | "Missed" chip background |
| `on-tertiary-container` | `#ffc0a7` | Text on "Missed" chip |
| `tertiary-fixed` | `#ffdbcd` | Warm tint backgrounds |
| `tertiary-fixed-dim` | `#ffb597` | Hover on tertiary |
| `on-tertiary-fixed` | `#360f00` | Text on fixed tertiary fills |
| `on-tertiary-fixed-variant` | `#7d2d00` | Secondary text on fixed tertiary fills |

### Surface & Background
| Token | Hex | Role |
|---|---|---|
| `background` | `#f8f9ff` | App background |
| `surface` | `#f8f9ff` | Card and panel surfaces |
| `surface-bright` | `#f8f9ff` | Brightest surface tone |
| `surface-tint` | `#1c6393` | Surface tint derived from primary |
| `surface-container-lowest` | `#ffffff` | Elevated cards |
| `surface-container-low` | `#eef4ff` | Slightly elevated containers |
| `surface-container` | `#e5eeff` | Standard containers / sidebar |
| `surface-container-high` | `#dbe9ff` | Input fields, pressed states |
| `surface-container-highest` | `#d1e4ff` | Dividers, borders |
| `surface-dim` | `#c9dcf7` | Overlay scrim |
| `surface-variant` | `#d1e4ff` | Chips, tags |

### On-Surface & Utility
| Token | Hex | Role |
|---|---|---|
| `on-surface` | `#081d30` | Primary text |
| `on-surface-variant` | `#41474f` | Secondary text, icons |
| `outline` | `#717880` | Input borders, dividers |
| `outline-variant` | `#c1c7d0` | Subtle dividers |
| `inverse-surface` | `#1f3246` | Toast / snackbar background |
| `inverse-on-surface` | `#eaf1ff` | Text on inverse surface |

### Error
| Token | Hex | Role |
|---|---|---|
| `error` | `#ba1a1a` | Error state |
| `error-container` | `#ffdad6` | Error chip background |
| `on-error` | `#ffffff` | Text on error |
| `on-error-container` | `#93000a` | Text on error container |

---

## Status Styles

| Status | Background | Text Color | Usage |
|---|---|---|---|
| **Taken** | `#98f8a5` | `#067432` | Medicine confirmed taken |
| **Missed** | `#993900` | `#ffc0a7` | Dose not taken in time |
| **Upcoming** | `#0f5c8c` | `#a5d3ff` | Scheduled, not yet due |

---

## Spacing Scale (spacingScale: 2)

| Token | Value | Use |
|---|---|---|
| `space-xs` | 0.5rem / 8px | Tight gaps (icon to label) |
| `space-sm` | 0.75rem / 12px | Chip / badge padding |
| `space-md` | 1.25rem / 20px | Standard component padding |
| `space-lg` | 2rem / 32px | Between card sections |
| `space-xl` | 3rem / 48px | Between major sections |
| `gutter` | 1.5rem / 24px | Desktop column gutter |
| `gutter-sm` | 1rem / 16px | Tablet column gutter |
| `margin` | 2.5rem / 40px | Desktop page margin |
| `margin-sm` | 1.25rem / 20px | Mobile page margin |

---

## Border Radius (roundness: ROUND_EIGHT)

| Level | Value | Applied to |
|---|---|---|
| Small | 8px | Chips, badges, buttons |
| Medium | 16px | Cards, panels |
| Large | 24px | Modals, bottom sheets |

---

## Button Styles

| Variant | Background | Text | Use |
|---|---|---|---|
| **Primary** | `#0f5c8c` | `#ffffff` | Main CTA ("I Took It") |
| **Secondary** | `#98f8a5` | `#067432` | Confirm / approve |
| **Outlined** | transparent | `#00446b` | Secondary choices |
| **Text / Ghost** | transparent | `#00446b` | Inline links, cancel |
| **Destructive** | `#ffdad6` | `#93000a` | Delete / remove |

Font: label-button — 22px / 700 / Atkinson Hyperlegible Next

---

## Sidebar Layout

Persistent left sidebar on desktop (>=1280px):
- Width: 280px fixed
- Background: `surface-container` (#e5eeff)
- Nav items: 56px tall, 8px radius active indicator
- Active: `#0f5c8c` background, `#ffffff` text
- Inactive: `#41474f` text
- Logo at top, Settings pinned at bottom

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 768px | Single column, bottom nav, margin-sm |
| Tablet | 768px – 1279px | Icon-only sidebar rail, gutter-sm |
| Desktop | >= 1280px | Full sidebar + content, gutter / margin |

> All Stitch canvases are DESKTOP (2560px wide). Responsive CSS is embedded in each screen's HTML.
