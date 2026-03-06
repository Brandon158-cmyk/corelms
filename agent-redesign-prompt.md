# AI Agent Prompt: Apply Design Language System to Existing UI

---

## Role & Objective

You are a senior UI/UX engineer tasked with **redesigning an existing system** to strictly conform to the Design Language Guide provided below. Your goal is to produce a pixel-faithful implementation of the design system — treating the guide as law, not suggestion. Every visual decision must trace back to a token or rule in the guide.

---

## Your Inputs

1. **Design Language Guide** — The full design specification (provided in context). Treat every token, rule, and principle as authoritative.
2. **Existing System** — The current codebase, components, or UI files to be redesigned (provided alongside this prompt). Analyse the current implementation before making changes.

---

## Mandatory Constraints

### ❶ Token Fidelity — No Exceptions

You **must** use only the colour, typography, spacing, radius, and shadow values defined in the design guide. No colours, font sizes, or spacing values may be introduced that are not in the token set. If a scenario is not covered by an existing token, use the closest defined token and flag it in a `<!-- DESIGN NOTE -->` comment.

Implement all design tokens as CSS custom properties at the `:root` level using **exactly** the token names defined in the guide:

```css
:root {
  /* ── Colours ──────────────────────────────────── */

  /* Accent */
  --color-accent-primary: #8b1e1e; /* Rich maroon */
  --color-accent-primary-dark: #6b1616; /* Deep maroon — hover/pressed */
  --color-accent-secondary: #a33a2a; /* Warm brick-red — secondary accent */

  /* Navigation surface */
  --color-nav-bg: #1e1428; /* Dark navy-plum */

  /* Surfaces */
  --color-surface-primary: #ffffff;
  --color-surface-secondary: #faf8f5; /* Warm off-white */

  /* Borders */
  --color-border-default: #e5e0db; /* Warm light border */
  --color-border-input: #d4cfc9; /* Warm input border */

  /* Text */
  --color-text-heading: #1e1428; /* Dark navy-plum */
  --color-text-body: #2e2626; /* Very dark warm charcoal */
  --color-text-secondary: #6b5f5f; /* Warm medium grey */
  --color-text-placeholder: #a89898; /* Warm light grey */
  --color-text-inverse: #ffffff; /* On dark/accent backgrounds */

  /* Semantic */
  --color-link: #1a5276; /* Deep academic navy-blue */
  --color-star-filled: #c9a227; /* Antique gold */
  --color-star-empty: #c8b8b8; /* Warm grey */
  --color-badge-verified: #8b1e1e; /* Maroon verification badge */
  --color-badge-label: #1a3a6b; /* Deep navy — FEATURED / UPDATED */
  --color-warning: #c9a227; /* Antique gold warning icon */

  /* Category icons */
  --color-category-maroon: #8b1e1e; /* Primary content types */
  --color-category-green: #1a5c3a; /* Practical tools / resources */
  --color-category-purple: #4a2080; /* Pathways / curriculum maps */

  /* Decorative */
  --color-overlay-dark: rgba(30, 20, 40, 0.65); /* Hero image overlay */
  --color-geo-stripe: #c9a227; /* Antique gold geometric stripe */

  /* ── Typography ───────────────────────────────── */
  --font-family-heading: Georgia, "Book Antiqua", Palatino, serif;
  --font-family-body: "Helvetica Neue", Arial, sans-serif;

  --font-size-hero: 34px;
  --font-size-page-title: 28px;
  --font-size-section-heading: 22px;
  --font-size-asset-title: 24px;
  --font-size-card-title: 16px;
  --font-size-sub-heading: 17px;
  --font-size-body: 14px;
  --font-size-caption: 13px;
  --font-size-tag: 11px;
  --font-size-nav: 14px;
  --font-size-tab: 13px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.6;
  --letter-spacing-uppercase: 0.5px;

  /* ── Spacing ──────────────────────────────────── */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;

  /* ── Border Radius ────────────────────────────── */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 50%;

  /* ── Shadows ──────────────────────────────────── */
  --shadow-none: none;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-popover: 0 4px 12px rgba(0, 0, 0, 0.15);

  /* ── Component tokens ─────────────────────────── */
  --nav-height: 50px;
  --input-height: 44px;
  --button-border-width: 1.5px;
  --tab-indicator-height: 3px;
  --card-border-width: 1px;
  --card-padding: 16px;
  --badge-pill-radius: 3px;
  --badge-pill-padding: 4px 10px;
  --star-size: 15px;
  --avatar-size-nav: 34px;
  --icon-size-nav: 22px;
  --icon-size-inline: 18px;
  --icon-size-meta: 14px;
  --hero-overlay-opacity: 0.65;
}
```

**Never** hard-code a hex value or pixel value in component styles. Always reference a `var(--token-name)`.

---

### ❷ Typography Rules — Strictly Enforced

- **Headings at hero and page level** → `font-family: var(--font-family-heading)` (serif). This is especially important on an education platform: the serif treatment signals intellectual heritage and credibility.
- **All other text** (cards, nav, tabs, body, metadata, badges) → `font-family: var(--font-family-body)` (sans-serif).
- **UPPERCASE `text-transform`** is permitted **only** for: tab labels, status badge text (`UPDATED`, `FEATURED`), and action button labels (`DOWNLOAD`, `ENROL`, `EXPORT`). Remove UPPERCASE from all other elements.
- **Italic** is not permitted anywhere in this design system.
- Do not introduce any font weight outside of the four defined: 400, 500, 600, 700.

---

### ❸ Elevation & Depth — Flat-First

- Do **not** add drop-shadows to elements unless the guide explicitly specifies them.
- Cards use `--shadow-card` or border-only. Do not apply `box-shadow` larger than `--shadow-card` to cards.
- Popovers / modals use `--shadow-popover`. No other shadow level exists.
- Convey depth through **colour contrast** (dark navy-plum nav against warm off-white content) and **border treatments** — not shadows.

---

### ❹ Component Patterns — Do Not Deviate

Apply the following patterns exactly as specified:

**Navigation Bar**

```
background:  var(--color-nav-bg)
height:      var(--nav-height)
color:       var(--color-text-inverse)
font-size:   var(--font-size-nav)
font-weight: var(--font-weight-regular)
Active item: 2–3px bottom border, var(--color-accent-primary)
Icons:       var(--color-text-inverse), var(--icon-size-nav)
```

**Content Tabs**

```
Active:   color var(--color-accent-primary); border-bottom var(--tab-indicator-height) solid var(--color-accent-primary)
Inactive: color var(--color-text-secondary); no border
Font:     UPPERCASE, var(--font-size-tab), var(--font-weight-medium), var(--letter-spacing-uppercase)
Tab row:  border-bottom 1px solid var(--color-border-default)
```

**Cards**

```
background:    var(--color-surface-primary)
border:        var(--card-border-width) solid var(--color-border-default)
border-radius: var(--radius-sm) to var(--radius-md)
padding:       var(--card-padding)
box-shadow:    var(--shadow-card)
Title:         var(--font-weight-bold), var(--color-text-body), var(--font-size-card-title), var(--line-height-tight)
Description:   var(--color-text-secondary), truncate with ellipsis
No images:     text-only cards — no image thumbnails
```

**Primary Button (Solid Maroon)**

```
background:      var(--color-accent-primary)
color:           var(--color-text-inverse)
border-radius:   var(--radius-sm)
text-transform:  uppercase
font-weight:     var(--font-weight-medium)
Hover:           background var(--color-accent-primary-dark)
```

**Secondary Button (Ghost)**

```
background:      var(--color-surface-primary)
border:          var(--button-border-width) solid var(--color-accent-primary)
color:           var(--color-accent-primary)
border-radius:   var(--radius-sm)
text-transform:  uppercase
Hover:           background var(--color-accent-primary); color var(--color-text-inverse)
```

**Search Button (Icon-only)**

```
background:     var(--color-accent-primary)
border-radius:  0 var(--radius-sm) var(--radius-sm) 0
size:           44px × 44px
icon:           var(--color-text-inverse)
```

**Form Inputs**

```
height:         var(--input-height)
border:         1px solid var(--color-border-input)
border-radius:  var(--radius-sm)
placeholder:    var(--color-text-placeholder)
Focus border:   var(--color-accent-primary)
```

**Status Badges (`UPDATED`, `FEATURED`)**

```
background:       var(--color-badge-label)
color:            var(--color-text-inverse)
text-transform:   uppercase
font-size:        var(--font-size-tag)
padding:          var(--badge-pill-padding)
border-radius:    var(--badge-pill-radius)
```

**Verification Badge**

```
background:     var(--color-badge-verified)
border-radius:  var(--radius-full)
width/height:   ~20px
icon:           white checkmark
```

**Star Ratings**

```
filled:   color var(--color-star-filled)
empty:    color var(--color-star-empty)
size:     var(--star-size)
```

**Icons**

```
Style:    outline/line only, rounded terminals, mono-colour
Sizes:    nav var(--icon-size-nav), inline var(--icon-size-inline), meta var(--icon-size-meta)
Never:    filled icons outside of category circles
```

**Category Icon Circles**

```
border-radius:  var(--radius-full)
diameter:       ~20px
Maroon:         var(--color-category-maroon)
Green:          var(--color-category-green)
Purple:         var(--color-category-purple)
```

**Hero Section**

```
background-image:  [photographic image]
overlay:           rgba(30,20,40,0.65) — NOT a directional gradient
Heading:           var(--font-family-heading), var(--font-size-hero), var(--font-weight-bold), var(--line-height-tight), var(--color-text-inverse)
Geometric stripe:  var(--color-geo-stripe), diagonal, upper-right
No text-shadow:    contrast achieved entirely by overlay opacity
```

**Avatar**

```
border-radius:  var(--radius-full)
width/height:   var(--avatar-size-nav)
background:     var(--color-accent-primary)
color:          var(--color-text-inverse)
content:        user initials, no border
```

**Popovers / Modals**

```
background:     var(--color-surface-primary)
border:         2px solid var(--color-accent-primary)
border-radius:  var(--radius-lg)
box-shadow:     var(--shadow-popover)
```

---

### ❺ Spacing Discipline

Use **only** the defined spacing tokens (`--space-xs` through `--space-xxl`) for all `margin`, `padding`, and `gap` values. Do not introduce arbitrary pixel values.

---

### ❻ Colour Restraint

- The accent colour (`--color-accent-primary` — maroon) appears **only** on: CTAs, active tab indicators, active nav underlines, search button, primary category circles, verification badge, avatar background, and popover/modal border.
- The majority of the interface must read as **warm neutral** — off-white, warm grey, and dark charcoal dominate.
- The antique gold (`--color-geo-stripe` / `--color-star-filled`) appears only on star ratings, the hero geometric stripe, and warning icons.
- Do not use any accent colour decoratively or as a background for large content surfaces.

---

## Process Instructions

Follow this sequence for each component or view:

1. **Audit first.** List all existing colour values, font declarations, spacing, border-radius, and shadows in the component. Identify which values violate the design guide.
2. **Map to tokens.** For each existing value, identify the correct design token replacement.
3. **Refactor.** Replace all hard-coded values with `var(--token-name)` references. Never hard-code a hex, px, or rem value that is covered by a token.
4. **Apply component patterns.** Ensure the component matches the structural and visual pattern defined in the guide (buttons, cards, nav, tabs, inputs, etc.).
5. **Verify typographic hierarchy.** Serif only at hero/page-title level. UPPERCASE only for tabs and badges.
6. **Check elevation.** No unauthorised shadows.
7. **Annotate gaps.** Where the guide is silent, use the closest existing token and leave a `<!-- DESIGN NOTE: [reason] -->` comment.

---

## Output Format

For each component or file modified, produce:

1. **The refactored code** — clean, token-referenced, conformant to the design guide.
2. **An audit summary** — a brief list of what was changed and why (e.g. "Replaced `#ff9900` with `var(--color-accent-primary)` — hard-coded orange swapped for maroon accent token").
3. **Design notes** — any gaps where the guide was silent and what assumption was made.

---

## What Success Looks Like

A successful redesign will:

- ✅ Have zero hard-coded colour values outside of the `:root` token declaration
- ✅ Use serif font **only** for hero and page-level headings
- ✅ Use `text-transform: uppercase` **only** for tabs and badge labels
- ✅ Have no `box-shadow` larger than `--shadow-popover`
- ✅ Have all cards following the same visual structure and token set with no image thumbnails
- ✅ Have the maroon accent appearing sparingly and purposefully
- ✅ Have all spacing values traceable to a `--space-*` token
- ✅ Have all interactive states (hover, active, focus) implemented per the guide's interaction rules
- ✅ Have warm off-white (`#FAF8F5`) as the page background — not pure white
- ✅ Have antique gold (`#C9A227`) used only for star ratings, the hero stripe, and warning icons

---

## Design Language Guide Reference

> `design-language-guide.md`

---

_This prompt is a binding specification. If a visual scenario is not covered by the guide, ask a clarifying question before proceeding — do not make undocumented assumptions about visual decisions._
