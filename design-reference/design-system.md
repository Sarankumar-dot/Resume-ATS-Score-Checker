# ResumeFit Design System

> Extracted from Stitch project `3001309720298223212`, asset `1d1d5d46ad284d7da642a73c6a80d238`

---

## Brand & Style
The design system centers on high-efficiency utility and professional clarity. It adopts a **Minimalist / Modern Corporate** aesthetic inspired by the "Software-as-a-Document" movement—balancing the density of a productivity tool with the breathability of a high-end publication.

The target audience consists of job seekers and professionals who require a high-trust environment to manage sensitive career data. The UI must evoke a sense of **precision, calm, and institutional reliability**. To achieve this, the system leverages heavy whitespace, a restricted color palette, and systematic alignment to ensure the content (the resume) remains the focal point.

---

## Colors

| Token | Hex |
|---|---|
| `primary` | `#3525cd` |
| `primary-container` | `#4f46e5` |
| `on-primary` | `#ffffff` |
| `on-primary-container` | `#dad7ff` |
| `secondary` | `#555f6f` |
| `secondary-container` | `#d6e0f3` |
| `on-secondary` | `#ffffff` |
| `on-secondary-container` | `#596373` |
| `tertiary` | `#005338` |
| `tertiary-container` | `#006e4b` |
| `on-tertiary` | `#ffffff` |
| `on-tertiary-container` | `#67f4b7` |
| `error` | `#ba1a1a` |
| `error-container` | `#ffdad6` |
| `on-error` | `#ffffff` |
| `on-error-container` | `#93000a` |
| `surface` | `#f8f9fa` |
| `surface-dim` | `#d9dadb` |
| `surface-bright` | `#f8f9fa` |
| `surface-container-lowest` | `#ffffff` |
| `surface-container-low` | `#f3f4f5` |
| `surface-container` | `#edeeef` |
| `surface-container-high` | `#e7e8e9` |
| `surface-container-highest` | `#e1e3e4` |
| `on-surface` | `#191c1d` |
| `on-surface-variant` | `#464555` |
| `outline` | `#777587` |
| `outline-variant` | `#c7c4d8` |
| `background` | `#f8f9fa` |
| `on-background` | `#191c1d` |
| `inverse-surface` | `#2e3132` |
| `inverse-on-surface` | `#f0f1f2` |
| `inverse-primary` | `#c3c0ff` |
| `surface-tint` | `#4d44e3` |
| `surface-variant` | `#e1e3e4` |

### Override Colors (from Stitch theme)
- **Primary override:** `#4f46e5`
- **Secondary override:** `#1f2937`
- **Tertiary override:** `#10b981`
- **Neutral override:** `#f9fafb`

### Usage Guidelines
- **Primary (Indigo):** Used for primary actions, focus states, and progress indicators.
- **Text Primary:** A deep slate used to maintain high legibility and contrast.
- **Success/Error:** Reserved strictly for status feedback (e.g., ATS score improvements or formatting issues).
- **Surface & Borders:** Surfaces are predominantly white, distinguished by `1px` borders rather than heavy shadows to maintain a "flat" yet structured document-like feel.

---

## Typography

Font: **Inter** (exclusive, all weights)

| Token | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| `display-lg` | 48px | 700 | 1.1 | -0.02em |
| `headline-lg` | 32px | 600 | 1.2 | -0.01em |
| `headline-lg-mobile` | 24px | 600 | 1.2 | — |
| `headline-md` | 24px | 600 | 1.3 | — |
| `headline-sm` | 18px | 600 | 1.4 | — |
| `body-lg` | 18px | 400 | 1.6 | — |
| `body-md` | 16px | 400 | 1.5 | — |
| `body-sm` | 14px | 400 | 1.5 | — |
| `label-md` | 14px | 500 | 1 | — |
| `label-sm` | 12px | 600 | 1 | 0.05em |

---

## Spacing

| Token | Value |
|---|---|
| `base` | 4px |
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 48px |
| `gutter` | 24px |
| `margin-mobile` | 16px |
| `margin-desktop` | auto |
| `max-width` | 1200px |

---

## Border Radius

| Token | Value |
|---|---|
| `sm` | 0.25rem (4px) |
| `DEFAULT` | 0.5rem (8px) |
| `md` | 0.75rem (12px) |
| `lg` | 1rem (16px) |
| `xl` | 1.5rem (24px) |
| `full` | 9999px |

---

## Layout & Spacing

- **Desktop:** 12-column grid, `1200px` max-width, centered with `auto` margins.
- **Mobile:** Single-column layout with `16px` side margins.
- **Rhythm:** 4px baseline. Generous vertical padding (`xl`) between major sections.

---

## Elevation & Depth

| Level | Description | Style |
|---|---|---|
| 0 (Background) | White or very light gray | `#F9FAFB` |
| 1 (Cards/Sections) | White surface with border | `1px solid #E5E7EB` |
| 2 (Dropdowns/Modals) | Subtle ambient shadow | `0 1px 3px 0 rgba(0,0,0,0.1)` |

Avoid colored shadows or gradients. Surfaces should feel physical, like stacked sheets of paper.

---

## Shapes

- **Standard Elements:** Buttons, input fields, cards → `rounded-lg` (8px)
- **Smaller Elements:** Checkboxes, tags → `rounded-md` (4px)
- **Avatars:** Strictly circular to contrast against the geometric grid.

---

## Components

### Buttons
- **Primary:** Background `#4F46E5`, Text `#FFFFFF`. No gradient. Hover: darken 10%.
- **Secondary:** Background `#FFFFFF`, Border `1px solid #E5E7EB`, Text `#1F2937`.
- **Tertiary/Ghost:** No border, Indigo text, subtle gray background on hover.

### Input Fields
- White background with `#D1D5DB` borders.
- Focus state: `2px` ring of Primary Indigo with `2px` offset.
- Labels positioned above in `label-md` (Medium weight).

### Cards
- Background: `#FFFFFF`
- Border: `1px solid #E5E7EB`
- Shadow: `shadow-sm` (subtle 2px blur)

### Navigation Bar
- Height: `64px`
- Fixed to top with `1px` bottom border
- Left-aligned logo, center-aligned links, right-aligned user profile/avatar

### Chips/Tags
- Small, `rounded-md` elements with light gray backgrounds and `#4B5563` text.
- Used for "Keywords Found" or "Skills" sections.
