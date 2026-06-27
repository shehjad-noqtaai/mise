---
name: Mise Design System
colors:
  surface: '#faf9f6'
  surface-dim: '#dadad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#424844'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f1f1ee'
  outline: '#727973'
  outline-variant: '#c2c8c2'
  surface-tint: '#496455'
  primary: '#173124'
  on-primary: '#ffffff'
  primary-container: '#2d4739'
  on-primary-container: '#98b5a3'
  inverse-primary: '#b0cdbb'
  secondary: '#4e635a'
  on-secondary: '#ffffff'
  secondary-container: '#cee5da'
  on-secondary-container: '#52675e'
  tertiary: '#2b2c2a'
  on-tertiary: '#ffffff'
  tertiary-container: '#41423f'
  on-tertiary-container: '#aeaeab'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ccead6'
  primary-fixed-dim: '#b0cdbb'
  on-primary-fixed: '#062014'
  on-primary-fixed-variant: '#324c3e'
  secondary-fixed: '#d1e8dd'
  secondary-fixed-dim: '#b5ccc1'
  on-secondary-fixed: '#0b1f18'
  on-secondary-fixed-variant: '#374b43'
  tertiary-fixed: '#e3e2df'
  tertiary-fixed-dim: '#c7c6c3'
  on-tertiary-fixed: '#1b1c1a'
  on-tertiary-fixed-variant: '#464744'
  background: '#faf9f6'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e0'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 48px
---

## Brand & Style

The brand personality is **capable, organized, and warm**, functioning as a digital sous-chef. It aims to reduce the "mental load" of cooking by providing a calm, structured environment.

The design style is **Minimalist with a Cookbook lean**. It prioritizes extreme legibility and whitespace to ensure the interface remains readable from a distance (e.g., on a kitchen counter). The aesthetic combines the precision of modern SaaS with the inviting, tactile feel of a high-end editorial food magazine.

**Key Visual Principles:**

- **Clarity over Decoration:** Every element must serve a functional purpose to avoid clutter in a busy kitchen environment.
- **Warm Utility:** Professional-grade tools that feel domestic and approachable.
- **Intentional Friction:** Use spacing and clear borders to prevent accidental taps when hands are busy or messy.

## Colors

The "Sage and Stone" palette is designed to evoke a professional yet organic kitchen atmosphere.

- **Primary (Deep Forest - #2D4739):** Used for primary actions, navigation headers, and authoritative UI elements. Provides high contrast against light backgrounds.
- **Secondary (Warm Sage - #8DA399):** Used for secondary actions, active states, and decorative icons.
- **Surface (Stone & Cream - #F2F1ED):** The primary background color to reduce eye strain compared to pure white.
- **Accent (Carrot Orange - #E67E22):** Reserved strictly for high-priority alerts: low stock, expiring ingredients, or timer completions.
- **Neutral (Stone Gray - #4A4A4A):** Used for body text and subtle borders to maintain a soft but legible hierarchy.

## Typography

The typography strategy employs a "High-Low" pairing.

**Playfair Display** is used for recipe titles and section headers, providing the sophisticated "cookbook" feel. It should be used sparingly to maintain its impact.

**Inter** is the workhorse font for all functional UI elements, ingredients lists, and instructions. For kitchen use, body text is slightly oversized (`18px`) to ensure instructions can be read from 2-3 feet away. High line-heights are essential to prevent users from losing their place in a recipe.

## Layout & Spacing

This design system utilizes a **Fixed Grid** for desktop (12 columns, 1140px max-width) and a **Fluid Grid** for mobile (4 columns).

**Spacing Philosophy:**

- **Generous Margins:** A minimum of 24px side margins on mobile to ensure content isn't cramped near the edge of the device.
- **Vertical Rhythm:** Use the `stack-lg` (32px) spacing between recipe steps to create a clear visual break.
- **Touch Targets:** All interactive elements (buttons, checkboxes) must have a minimum height of 48px to accommodate "messy kitchen hands."

## Elevation & Depth

Depth is communicated through **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows.

- **Level 0 (Base):** The Cream/Stone background (#F2F1ED).
- **Level 1 (Cards):** Pure white surfaces with a 1px solid border (#D1D1CB). This creates a "sheet of paper" effect.
- **Level 2 (Modals/Overlays):** These use a subtle ambient shadow (8% opacity Forest Green) to indicate they are temporary and float above the main workspace.

Avoid backdrop blurs; keep surfaces opaque to ensure maximum text contrast against the background at all times.

## Shapes

The shape language is **Rounded**, reflecting a friendly and approachable personality.

- **Cards & Inputs:** Use `rounded-lg` (1rem) for a soft, modern look.
- **Buttons:** Use `rounded-xl` (1.5rem) or full pill-shape for primary calls to action to make them feel "tappable" and distinct from layout containers.
- **Progress Bars:** Use fully rounded (pill) ends for inventory tracking to feel fluid and organic.

## Components

### Recipe Cards

Structured with a 2:1 aspect ratio image at the top. The title uses `headline-md` (Playfair Display) positioned in a white container that slightly overlaps the image to create depth.

### Inventory Progress Bars

Used for tracking pantry levels. The track should be a light version of Stone Gray, with the fill using Sage Green for "In Stock" and Carrot Orange for "Low Stock" (below 20%).

### Nutrition Badges

Small, pill-shaped chips using `label-sm`. Backgrounds should be low-saturation versions of the Stone palette to keep them secondary to the main recipe content.

### Step-by-Step Instructions

List items with large, Forest Green circular numbers. The text uses `body-lg` with a 1.6x line height. Include a checkbox for each step that dims the text once completed, helping users keep their place.

### Buttons

- **Primary:** Forest Green background with White text.
- **Secondary:** Transparent background with Sage Green 2px border.
- **Ghost:** Stone Gray text for less important actions like "Cancel" or "Skip."

### Clean Calendar View

A minimal grid with Stone Gray borders. The "Current Day" is highlighted with a soft Sage circle. Planned meals appear as high-contrast labels within the grid.
