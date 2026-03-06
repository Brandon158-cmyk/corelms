# Visual Design Language Guide
### Edition: Premium Education — Maroon Colour Scheme

> **Note:** All hex codes and pixel values are estimated from visual inspection of the source design. Validate against source CSS before production use. All token names are neutral and non-brand-specific.

---

## Colour Design Rationale

This system uses a **rich maroon** as its primary accent — a colour with deep associations with academic authority, institutional heritage, and prestige. It is paired with a **dark navy-plum** for structural surfaces, **antique gold** for highlights and star ratings, and **warm off-whites and muted greys** for surfaces and body text. Together, the palette communicates high-value, trustworthy, and intellectually serious — appropriate for a premium education platform.

---

## 1. Colour System

### Design Tokens — Colours

| Token | Hex | Role |
|---|---|---|
| `--color-accent-primary` | `#8B1E1E` | Rich maroon — primary accent: CTAs, active tab indicators, search button, badges, avatar background, category icon circles |
| `--color-accent-primary-dark` | `#6B1616` | Deep maroon — hover and pressed state for primary accent |
| `--color-accent-secondary` | `#A33A2A` | Warm brick-red — secondary accent tone, gradient bands, lighter accent UI elements |
| `--color-nav-bg` | `#1E1428` | Dark navy-plum — top navigation bar and dark header surfaces |
| `--color-surface-primary` | `#FFFFFF` | Cards, modals, inputs, table backgrounds |
| `--color-surface-secondary` | `#FAF8F5` | Warm off-white — page background behind cards; slightly warmer than pure white for premium feel |
| `--color-border-default` | `#E5E0DB` | Warm light border — card borders, table row dividers, tab underline rails, horizontal rules |
| `--color-border-input` | `#D4CFC9` | Warm input field border |
| `--color-text-heading` | `#1E1428` | Dark navy-plum — page titles, card headings; matches nav for visual cohesion |
| `--color-text-body` | `#2E2626` | Very dark warm charcoal — body text, card titles |
| `--color-text-secondary` | `#6B5F5F` | Warm medium grey — descriptions, metadata labels, breadcrumbs |
| `--color-text-placeholder` | `#A89898` | Warm light grey — input placeholders, disabled text |
| `--color-text-inverse` | `#FFFFFF` | White — text on dark or accent-coloured backgrounds |
| `--color-link` | `#1A5276` | Deep academic navy-blue — hyperlinks, tag links |
| `--color-star-filled` | `#C9A227` | Antique gold — filled star ratings; signals premium quality |
| `--color-star-empty` | `#C8B8B8` | Warm grey — empty star outlines |
| `--color-badge-verified` | `#8B1E1E` | Maroon — verification check-mark circle (consistent with primary accent) |
| `--color-badge-label` | `#1A3A6B` | Deep navy — "FEATURED" / "UPDATED" pill background |
| `--color-category-green` | `#1A5C3A` | Deep forest green — category icon: practical tools / resources |
| `--color-category-purple` | `#4A2080` | Deep academic purple — category icon: pathways / curriculum maps |
| `--color-category-maroon` | `#8B1E1E` | Maroon — category icon: primary content types (same as accent primary) |
| `--color-overlay-dark` | `rgba(30,20,40,0.65)` | Dark navy-plum tinted overlay — hero image; warmer and richer than pure black |
| `--color-geo-stripe` | `#C9A227` | Antique gold — decorative geometric diagonal stripe element |
| `--color-warning` | `#C9A227` | Antique gold — inline warning triangle icon |

---

### Colour Palette Summary

#### Primary Palette

| Role | Token | Hex |
|---|---|---|
| Primary Accent | `--color-accent-primary` | `#8B1E1E` |
| Primary Accent Hover | `--color-accent-primary-dark` | `#6B1616` |
| Secondary Accent | `--color-accent-secondary` | `#A33A2A` |
| Navigation Surface | `--color-nav-bg` | `#1E1428` |

#### Surface & Neutral Palette

| Role | Token | Hex |
|---|---|---|
| Primary surface | `--color-surface-primary` | `#FFFFFF` |
| Secondary surface | `--color-surface-secondary` | `#FAF8F5` |
| Default border | `--color-border-default` | `#E5E0DB` |
| Input border | `--color-border-input` | `#D4CFC9` |
| Heading text | `--color-text-heading` | `#1E1428` |
| Body text | `--color-text-body` | `#2E2626` |
| Secondary text | `--color-text-secondary` | `#6B5F5F` |
| Placeholder text | `--color-text-placeholder` | `#A89898` |
| Inverse text | `--color-text-inverse` | `#FFFFFF` |

#### Accent & Semantic Palette

| Role | Token | Hex |
|---|---|---|
| Hyperlinks | `--color-link` | `#1A5276` |
| Star — filled | `--color-star-filled` | `#C9A227` |
| Star — empty | `--color-star-empty` | `#C8B8B8` |
| Verified badge | `--color-badge-verified` | `#8B1E1E` |
| Featured / Updated badge | `--color-badge-label` | `#1A3A6B` |
| Category — primary | `--color-category-maroon` | `#8B1E1E` |
| Category — green | `--color-category-green` | `#1A5C3A` |
| Category — purple | `--color-category-purple` | `#4A2080` |
| Geo stripe / Warning | `--color-geo-stripe` / `--color-warning` | `#C9A227` |
| Hero overlay | `--color-overlay-dark` | `rgba(30,20,40,0.65)` |

---

### Gradient & Overlay Treatments

- **Hero Banner Overlay** — A uniform semi-transparent overlay (`rgba(30,20,40,0.65)`) sits over the hero photograph. The navy-plum tint adds warmth and avoids the coldness of a pure black overlay. White text is legible without text-shadow.
- **Brand Separator Strip** — A thin horizontal band (≈6–8px) between the hero and content area. Transitions left-to-right: `--color-accent-primary` (maroon) → `--color-accent-secondary` (brick-red) → `--color-geo-stripe` (gold) → `--color-nav-bg` (dark plum). Creates a prestigious multi-tone brand separator.
- **Geometric Stripe** — A bold diagonal stripe in `--color-geo-stripe` (#C9A227, antique gold) in the hero's upper-right corner as a brand motif. Gold is chosen here over red to reinforce the premium academic aesthetic.

---

## 2. Typography

### Typefaces

| Role | Family | Fallback Stack |
|---|---|---|
| Headings (hero, page, section) | Serif — Georgia or equivalent classic serif | `Georgia, "Book Antiqua", Palatino, serif` |
| Body, UI, nav, tabs, metadata | Geometric sans-serif — Helvetica Neue or equivalent | `"Helvetica Neue", Arial, sans-serif` |
| Monospace | Not used | — |

> **Education system note:** The serif typeface is especially important here. On a premium education platform, the serif heading treatment communicates intellectual heritage and institutional credibility. It should appear at every major heading level, not just the hero.

### Type Scale

| Token | Size | Usage |
|---|---|---|
| `--font-size-hero` | `34px` | Hero heading |
| `--font-size-page-title` | `28px` | Page-level title |
| `--font-size-section-heading` | `22px` | Section headings |
| `--font-size-asset-title` | `24px` | Detail page content title |
| `--font-size-card-title` | `16px` | Card headings in grid |
| `--font-size-sub-heading` | `17px` | Sub-section labels ("At a Glance", "About") |
| `--font-size-body` | `14px` | Body paragraphs, card descriptions |
| `--font-size-caption` | `13px` | Metadata — counts, dates, table headers |
| `--font-size-tag` | `11px` | Badge labels, category pills (UPPERCASE) |
| `--font-size-nav` | `14px` | Navigation bar items |
| `--font-size-tab` | `13px` | Content tab labels (UPPERCASE) |

### Font Weights

| Token | Value | Usage |
|---|---|---|
| `--font-weight-regular` | `400` | Body text, descriptions, metadata, inactive nav |
| `--font-weight-medium` | `500` | Tab labels, tag text, table headers |
| `--font-weight-semibold` | `600` | Sub-headings, card titles |
| `--font-weight-bold` | `700` | Page titles, hero headings, section headings |

### Text Casing Rules

- `UPPERCASE` — reserved exclusively for: tab labels, status badges (`UPDATED`, `FEATURED`), and action labels (`DOWNLOAD`, `ENROL`, `EXPORT`).
- `Italic` — not used anywhere in this design system.

### Line-Height & Letter-Spacing

| Token | Value | Usage |
|---|---|---|
| `--line-height-tight` | `1.2` | Hero headings, card titles |
| `--line-height-normal` | `1.5` | Body text |
| `--line-height-relaxed` | `1.6` | Long-form body paragraphs |
| `--letter-spacing-uppercase` | `0.5px` | Uppercase tab labels and badge text |

### Colour Per Typography Level

| Level | Colour Token |
|---|---|
| Hero heading / sub-heading | `--color-text-inverse` |
| Page title | `--color-text-heading` (#1E1428) |
| Section heading | `--color-text-heading` or `--color-text-inverse` on dark bg |
| Card title | `--color-text-body` (#2E2626) |
| Body text | `--color-text-body` |
| Card description | `--color-text-secondary` (#6B5F5F) |
| Metadata (counts, dates) | `--color-text-secondary` |
| Placeholder text | `--color-text-placeholder` (#A89898) |
| Links & hashtag tags | `--color-link` (#1A5276) |
| Active tab | `--color-accent-primary` (#8B1E1E) |
| Inactive tab | `--color-text-secondary` |
| Nav items | `--color-text-inverse` |
| Breadcrumb / category label | `--color-text-secondary` |

---

## 3. Iconography & Visual Indicators

### Icon Style Rules

- **Style** — Outline / line icons only. No filled icons outside of category circles.
- **Stroke weight** — ~1.5–2px.
- **Corners** — Rounded terminals.
- **Colour** — Mono-colour only:
  - `--color-text-body` (#2E2626) on light backgrounds
  - `--color-text-inverse` (#FFFFFF) in the dark nav bar
  - `--color-accent-primary` (#8B1E1E) for interactive/active icons

### Icon Size Scale

| Token | Size | Usage |
|---|---|---|
| `--icon-size-nav` | `22px` | Navigation bar utility icons |
| `--icon-size-inline` | `18–20px` | Inline action icons (pin, share, follow, copy) |
| `--icon-size-card` | `16–18px` | Card corner bookmark/save overlays |
| `--icon-size-meta` | `14–16px` | Metadata inline icons |
| `--icon-size-sort` | `12–14px` | Table column sort arrows |

### Badges & Status Indicators

#### Category Pills
Each card displays a filled circle (≈20px diameter) + text label:

| Category Type | Token | Hex |
|---|---|---|
| Primary content types | `--color-category-maroon` | `#8B1E1E` |
| Practical tools / resources | `--color-category-green` | `#1A5C3A` |
| Pathways / curriculum maps | `--color-category-purple` | `#4A2080` |

#### Status Badges (`UPDATED`, `FEATURED`)

```
Background:    --color-badge-label (#1A3A6B)
Text:          --color-text-inverse (#FFFFFF), UPPERCASE
Font-size:     --font-size-tag (11px)
Font-weight:   --font-weight-medium (500)
Letter-spacing: --letter-spacing-uppercase (0.5px)
Border-radius: --badge-pill-radius (3px)
Padding:       --badge-pill-padding (4px 10px)
Position:      Bottom-right of card
```

#### Verification Badge

```
Shape:      Circle, --radius-full (50%), ~20px diameter
Background: --color-badge-verified (#8B1E1E)
Icon:       White checkmark
```

#### Star Ratings

```
Filled:  --color-star-filled (#C9A227, antique gold)
Empty:   --color-star-empty (#C8B8B8)
Size:    --star-size (15px)
Number:  --color-text-secondary, displayed left of stars
```

#### Warning Indicator

Inline `⚠` icon in `--color-warning` (#C9A227) within body text.

### Avatar Treatments

| Property | Value |
|---|---|
| Shape | Circle, `--radius-full` |
| Size | `--avatar-size-nav` (34px) |
| Background | `--color-accent-primary` (#8B1E1E) |
| Text | User initials, `--color-text-inverse`, bold |
| Border | None |

---

## 4. Component Specifications

### Buttons

#### Primary Action — Solid Maroon

```
Background:      --color-accent-primary (#8B1E1E)
Text:            --color-text-inverse (#FFFFFF)
Border:          none
Border-radius:   --radius-sm (4px)
Font-size:       --font-size-caption (13px)
Font-weight:     --font-weight-medium (500)
Text-transform:  UPPERCASE
Letter-spacing:  --letter-spacing-uppercase (0.5px)
Hover:           background --color-accent-primary-dark (#6B1616)
Transition:      150–250ms ease-out
```

#### Secondary Action — Ghost / Outline

```
Background:      --color-surface-primary (#FFFFFF)
Text:            --color-accent-primary (#8B1E1E)
Border:          1.5px solid --color-accent-primary (#8B1E1E)
Border-radius:   --radius-sm (4px)
Font-size:       --font-size-caption (13px)
Font-weight:     --font-weight-medium (500)
Text-transform:  UPPERCASE
Icon:            --color-accent-primary, positioned left of label
Hover:           Background fills --color-accent-primary; text and icon switch to --color-text-inverse
Padding:         10px 24–32px
Transition:      150–250ms ease-out
```

#### Search Button — Icon-Only, Attached to Input

```
Background:      --color-accent-primary (#8B1E1E)
Icon:            White magnifying glass
Size:            44px × 44px
Border-radius:   0 4px 4px 0  (flush left, --radius-sm right)
Hover:           --color-accent-primary-dark
```

#### Disabled State

Text and border: `--color-text-placeholder` (#A89898). Background: unchanged.

---

### Cards

```
Background:      --color-surface-primary (#FFFFFF)
Border:          1px solid --color-border-default (#E5E0DB)
Border-radius:   --radius-sm to --radius-md (4–6px)
Shadow:          --shadow-card (0 1px 3px rgba(0,0,0,0.08))
Padding:         --card-padding (16px) all sides
```

#### Card Anatomy (top → bottom)

1. **Category pill row** — filled circle (category colour, ≈20px) + text label(s), separated by ` | `
2. **Title** — `--font-weight-bold`, `--color-text-body`, `--font-size-card-title`, `--line-height-tight`
3. **Description** — `--color-text-secondary`, `--font-size-body`, truncated with ellipsis
4. **Bottom metadata row** — usage/enrolment count, star rating, verification badge

Cards are **text-only** — no image thumbnails in the card grid.

---

### Navigation Bar

```
Background:   --color-nav-bg (#1E1428)
Height:       --nav-height (50px)
Text:         --color-text-inverse (#FFFFFF)
Font-size:    --font-size-nav (14px)
Font-weight:  --font-weight-regular (400)
Active item:  2–3px solid bottom border, --color-accent-primary (#8B1E1E)
Icons:        --color-text-inverse, --icon-size-nav (22px)
Icon gap:     ~12px between utility icons
```

Logo rendered in white on the dark nav surface. The deep navy-plum creates strong contrast against the warm off-white content area below.

---

### Content Tabs

```
Active tab:
  Text:         --color-accent-primary (#8B1E1E)
  Indicator:    3px solid bottom border, --color-accent-primary

Inactive tab:
  Text:         --color-text-secondary (#6B5F5F)
  Indicator:    none

Tab row bottom rail:  1px solid --color-border-default (#E5E0DB)
Background:           --color-surface-primary
Font-size:            --font-size-tab (13px)
Font-weight:          --font-weight-medium (500)
Text-transform:       UPPERCASE
Letter-spacing:       --letter-spacing-uppercase (0.5px)
```

---

### Form Inputs & Search Bars

```
Background:      --color-surface-primary (#FFFFFF)
Border:          1px solid --color-border-input (#D4CFC9)
Border-radius:   --radius-sm (4px)
Height:          --input-height (44px)
Placeholder:     --color-text-placeholder (#A89898), --font-size-body (14px)
Focus border:    1px solid --color-accent-primary (#8B1E1E)
```

---

### Tables

```
Header text:    --font-weight-semibold (600), --color-text-secondary, --font-size-caption (13px)
Sort arrows:    bidirectional ↑↓, --icon-size-sort
Row separators: 1px solid --color-border-default (#E5E0DB)
Empty state:    "No Data Found", --color-text-secondary, left-aligned
Pagination:     text-based « ‹ › » controls, --color-text-secondary
```

---

### Modals / Popovers

```
Background:    --color-surface-primary (#FFFFFF)
Border:        2px solid --color-accent-primary (#8B1E1E)
Border-radius: --radius-lg (8px)
Shadow:        --shadow-popover (0 4px 12px rgba(0,0,0,0.15))
```

---

## 5. Elevation & Depth

### Shadow Tokens

| Token | Value | Usage |
|---|---|---|
| `--shadow-none` | `none` | Table rows, sidebar filters, body content |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.08)` | Grid cards |
| `--shadow-popover` | `0 4px 12px rgba(0,0,0,0.15)` | Floating popovers, dropdown menus |

### Philosophy — Flat, Border-Driven

Depth communicated through **colour contrast** and **warm border treatments**, not heavy shadows.

1. **Base** — `--color-surface-secondary` (#FAF8F5) warm off-white
2. **Content** — White cards separated by warm borders
3. **Nav** — Deep navy-plum; contrast via colour, not shadow
4. **Hero** — Photo + navy-plum tinted overlay
5. **Floating** — Popovers with `--shadow-popover` and maroon border
6. **FAB** — Maroon notification bubble, highest elevation

---

## 6. Spacing System

Base unit: `4px`

| Token | Value |
|---|---|
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `16px` |
| `--space-lg` | `24px` |
| `--space-xl` | `32px` |
| `--space-xxl` | `48px` |

---

## 7. Border Radius Tokens

| Token | Value | Usage |
|---|---|---|
| `--radius-none` | `0px` | Sharp edges, flush joins |
| `--radius-sm` | `4px` | Buttons, inputs, badge pills |
| `--radius-md` | `6px` | Cards |
| `--radius-lg` | `8px` | Popovers, modals |
| `--radius-full` | `50%` | Avatars, category icon circles, verification badge |

---

## 8. Component-Specific Tokens (Quick Reference)

| Token | Value |
|---|---|
| `--nav-height` | `50px` |
| `--input-height` | `44px` |
| `--button-border-width` | `1.5px` |
| `--tab-indicator-height` | `3px` |
| `--card-border-width` | `1px` |
| `--card-padding` | `16px` |
| `--badge-pill-radius` | `3px` |
| `--badge-pill-padding` | `4px 10px` |
| `--star-size` | `15px` |
| `--avatar-size-nav` | `34px` |
| `--icon-size-nav` | `22px` |
| `--icon-size-inline` | `18px` |
| `--icon-size-meta` | `14px` |
| `--hero-overlay-opacity` | `0.65` |

---

## 9. Hero & Imagery Guidelines

### Hero Banner

- Full-width photographic background — academic settings preferred: libraries, lecture halls, graduation, collaborative study, professional mentorship.
- Uniform dark overlay `rgba(30,20,40,0.65)` (navy-plum tint) — **not** a directional gradient.
- All hero text: `--color-text-inverse` — no text-shadow required.
- Heading: serif (`--font-family-heading`), `--font-size-hero`, `--font-weight-bold`, `--line-height-tight`.
- Geometric stripe: `--color-geo-stripe` (#C9A227, antique gold), diagonal, positioned upper-right.

### Imagery Direction

- Prefer imagery evoking scholarship, growth, and aspiration: libraries, graduation, collaborative learning, professional mentorship.
- Warm, natural lighting preferred over cold or clinical tones.
- Avoid generic stock aesthetics — seek editorial, candid, human-centred photography.

### Content Area

Cards are **text-only** — no image thumbnails within the card grid.

---

## 10. Interaction & Motion

| Element | Behaviour |
|---|---|
| Solid maroon button hover | Darkens to `--color-accent-primary-dark` (#6B1616) |
| Ghost button hover | Fills `--color-accent-primary`; text/icon flips to white |
| Card hover | Border darkens to `--color-text-secondary`; title gains maroon underline |
| Link hover | Darkens; gains underline |
| Nav item hover | Maroon underline or subtle opacity increase |
| Active tab transition | Maroon bottom-border slides/fades between tabs |
| Input focus | Border: `--color-accent-primary` |
| Checkbox selected | Maroon fill, white check |
| Transition timing | `150–250ms`, `ease-out` |

---

## 11. Design Principles

| Principle | Implementation |
|---|---|
| **Academic Authority** | Dark navy-plum nav, serif headings, structured card layout — institutional credibility |
| **Premium Quality** | Antique gold stars and stripe, warm surfaces, maroon accent — avoids sterile corporate feel |
| **Clarity & Function** | Flat elevation, generous whitespace, minimal decoration — content is always primary |
| **Warmth Without Informality** | Warm off-white surfaces and warm greys prevent coldness while maintaining professionalism |
| **Colour Restraint** | Maroon used sparingly — most of the UI is warm neutral (cream, warm grey, charcoal) |
| **Typography Hierarchy** | Serif for hero and page-level headings; sans-serif for all UI elements |
| **Consistent Card Pattern** | Every card: same border, radius, padding, and anatomy — no exceptions |
| **Systematic Category Coding** | Each content category maps to a consistent icon circle colour across all contexts |
