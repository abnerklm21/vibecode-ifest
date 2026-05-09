---
name: Midnight Cyber-Finance
colors:
  surface: '#1b0e20'
  surface-dim: '#1b0e20'
  surface-bright: '#433448'
  surface-container-lowest: '#16091b'
  surface-container-low: '#241729'
  surface-container: '#281b2d'
  surface-container-high: '#332538'
  surface-container-highest: '#3e2f43'
  on-surface: '#f2dbf5'
  on-surface-variant: '#d1c1d9'
  inverse-surface: '#f2dbf5'
  inverse-on-surface: '#3a2b3f'
  outline: '#9a8ca2'
  outline-variant: '#4e4356'
  surface-tint: '#dfb7ff'
  primary: '#dfb7ff'
  on-primary: '#4b007e'
  primary-container: '#9d00ff'
  on-primary-container: '#f7e5ff'
  inverse-primary: '#8c00e5'
  secondary: '#dabcea'
  on-secondary: '#3e274c'
  secondary-container: '#553d64'
  on-secondary-container: '#c8aad8'
  tertiary: '#ffb3b2'
  on-tertiary: '#680012'
  tertiary-container: '#d50030'
  on-tertiary-container: '#ffe5e4'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f1daff'
  primary-fixed-dim: '#dfb7ff'
  on-primary-fixed: '#2d004f'
  on-primary-fixed-variant: '#6b00b0'
  secondary-fixed: '#f4daff'
  secondary-fixed-dim: '#dabcea'
  on-secondary-fixed: '#271236'
  on-secondary-fixed-variant: '#553d64'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#ffb3b2'
  on-tertiary-fixed: '#410008'
  on-tertiary-fixed-variant: '#92001e'
  background: '#1b0e20'
  on-background: '#f2dbf5'
  surface-variant: '#3e2f43'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  body-main:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  currency-display:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.1em
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system establishes a high-octane, technical atmosphere for financial management. By merging the transparency of Glassmorphism with the aggressive, "gamer-centric" silhouettes of cyber-aesthetic design, the interface transforms mundane financial reporting into a high-performance dashboard. 

The aesthetic is characterized by deep immersion, utilizing a "Midnight Purple" foundation that feels infinite. Visual hierarchy is driven by luminescent accents and neon glows rather than traditional lighting. The absence of rounded corners communicates precision and technical rigidity, catering to users who value a sharp, modern, and data-heavy environment.

## Colors

The color palette is built on a "Void" philosophy. The base layers utilize **Deep Midnight Purple** (#05000A) to create a black-hole effect, ensuring that the **Electric Purple** (#9D00FF) accents appear to emit light. 

Gradients must always flow from a dark purple (`#120021`) to a pure black (`#000000`) at a 135-degree angle to provide subtle depth without compromising the dark-mode integrity. **Crimson Red** (#FF003C) is reserved exclusively for negative financial flow (expenses) and critical warnings, creating a high-contrast visual "alarm" against the cool purple tones. **Neon Violet** is used for interactive states and primary focus areas.

## Typography

This design system employs **Hanken Grotesk** for its primary communication. It is a modern, sharp sans-serif that maintains high legibility even in low-light dark modes. 

For technical data—specifically currency (Rp) and timestamps—**JetBrains Mono** is introduced to provide a monospaced "terminal" feel, reinforcing the cyber-aesthetic. Headings should be styled with tight letter spacing and heavy weights to appear impactful, while body text remains breathable to ensure financial reports are easy to scan.

## Layout & Spacing

The layout follows a strict **Fixed Grid** model for desktop and tablet, ensuring the "Glass" containers maintain a structural, architectural feel. For mobile, the system transitions to a fluid single-column layout with 24px safe-area margins.

All spacing is based on a 4px base unit to ensure perfect alignment of sharp edges. High density is encouraged; components should feel tightly packed and efficient, reminiscent of a command center. Use 16px gutters between cards to allow the background midnight-purple gradients to peek through, creating clear separation between glass layers.

## Elevation & Depth

Depth is achieved through **Glassmorphism** and **Luminescence** rather than shadows. 

1.  **Backdrop Layer:** Dark purple-to-black linear gradient.
2.  **Mid Layer (Cards):** Glassmorphic surfaces using `backdrop-filter: blur(20px)` and a semi-transparent purple fill. Each card must have a 1px solid border (`rgba(157, 0, 255, 0.2)`) to define its sharp edges.
3.  **Top Layer (Interactive):** Elements that are "active" or "hovered" emit an `outer-glow` using CSS `box-shadow: 0 0 15px rgba(157, 0, 255, 0.5)`.

There are no soft shadows. Elevation is signified by the intensity of the border glow and the clarity of the background blur.

## Shapes

The shape language is strictly **Sharp (0px)**. No border-radii are permitted on any UI element, including buttons, cards, input fields, or notification toasts. This geometric rigidity is core to the "gamer/cyber" aesthetic and distinguishes the system from friendlier, soft-cornered competitors. 

To add visual interest without using curves, use diagonal clipped corners (via `clip-path`) for primary action buttons to create a "stealth-wing" or "hexagonal" feel.

## Components

### Buttons
Primary buttons use a solid **Electric Purple** background with white text. They must feature a persistent `2px` outer glow in the same hue. Secondary buttons are transparent with a `1px` Electric Purple border. All buttons are rectangular with 0px radius.

### Glass Cards
Cards are the primary container. They utilize a `rgba(18, 0, 33, 0.6)` background with a high `backdrop-filter: blur(25px)`. The border should be a thin `1px` stroke in a lighter violet shade.

### Financial Inputs
Input fields are "ghost" style: no background fill, only a bottom border of `2px` in Dark Purple. When focused, the bottom border flashes to **Electric Purple** and glows. The currency prefix "Rp" should be styled in **JetBrains Mono** and remain static on the left.

### Expense/Warning Chips
Chips indicating negative flow use **Crimson Red** text with a subtle `rgba(255, 0, 60, 0.1)` background tint and a sharp `1px` Crimson border. 

### Data Visualization
Charts must use pure CSS gradients and borders. Use "Electric Purple" for income lines and "Crimson Red" for expense lines. Areas under the lines should use a vertical gradient from the stroke color to transparent.