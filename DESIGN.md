---
name: Feathers Playground
description: Schema-aware API playground for FeathersJS v5 — terminal-adjacent dev tool
colors:
  primary: "oklch(0.65 0.146 60)"
  primary-strong: "oklch(0.48 0.155 60)"
  primary-strong-hover: "oklch(0.42 0.155 60)"
  primary-foreground: "oklch(0.99 0.005 60)"
  accent: "oklch(0.32 0.10 340)"
  accent-foreground: "oklch(0.97 0.005 340)"
  foreground: "oklch(0.18 0.020 60)"
  background: "oklch(1 0 0)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.18 0.020 60)"
  secondary: "oklch(0.97 0.005 60)"
  secondary-foreground: "oklch(0.25 0.015 60)"
  muted: "oklch(0.97 0.005 60)"
  muted-foreground: "oklch(0.45 0.012 60)"
  destructive: "oklch(0.50 0.20 25)"
  destructive-foreground: "oklch(0.99 0.005 25)"
  border: "oklch(0.90 0.008 60)"
  input: "oklch(0.90 0.008 60)"
  ring: "oklch(0.48 0.155 60)"
  success: "oklch(0.50 0.13 145)"
  success-foreground: "oklch(0.99 0.005 145)"
  success-bg: "oklch(0.94 0.04 145)"
  warning: "oklch(0.48 0.155 60)"
  warning-foreground: "oklch(0.99 0.005 60)"
  warning-bg: "oklch(0.94 0.06 80)"
  info: "oklch(0.40 0.10 240)"
  info-foreground: "oklch(0.99 0.005 240)"
  info-bg: "oklch(0.94 0.03 240)"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontWeight: 600
    fontSize: "1.25rem"
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontWeight: 400
    fontSize: "0.875rem"
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontWeight: 500
    fontSize: "0.8125rem"
    lineHeight: 1.4
  mono:
    fontFamily: "ui-monospace, SF Mono, JetBrains Mono, Menlo, Consolas, monospace"
    fontWeight: 400
    fontSize: "0.8125rem"
    lineHeight: 1.5
    fontFeatureSettings: "'liga' 0, 'calt' 0"
rounded:
  sm: "2px"
  md: "4px"
  lg: "6px"
spacing:
  hairline: "1px"
  field: "0.5rem"
  panel: "1rem"
  section: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-strong-hover}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  chip-method:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  status-badge-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  status-badge-danger:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  status-badge-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
---

# Design System: Feathers Playground

## 1. Overview

**Creative North Star: "The Lab Notebook."**

The Feathers Playground is a tool that disappears into the developer's workflow. Like a well-kept lab notebook, it earns its space by being precise, legible, and unobtrusive — the page is there to record the experiment, not to show off. Color is a marker for state, not decoration. Type is functional, with monospace reserved for the things that look right in monospace: HTTP verbs, service paths, request bodies, response JSON.

The system rejects the default 2025 dev-tool look. No stock shadcn blue, no SaaS cream gradients, no Tailwind UI look-alike templates, no playful emoji empty states, no information-overload à la Postman. The chrome is quiet enough that a developer's attention stays on the request and the response — not on the tool.

**Key Characteristics:**
- **Terminal-adjacent vocabulary.** Mono for verbs, methods, paths, JSON. Sharp typographic hierarchy. Not a costume, just familiar.
- **Restrained palette.** Pure white paper, near-black ink with a brand undertone, a single honey accent reserved for action and selection. Aubergine accents typographic moments (links, code callouts).
- **Flat by default.** Depth comes from hairline borders and a single surface-card layer. No shadows at rest.
- **Earned density.** Dense where developers work (method picker, headers, body, response); spacious where they read (status badges, errors, schema).
- **Honest state.** Real HTTP status codes, real error messages, real auth flow. No masking.

## 2. Colors

A two-voice palette: **Honey** for action and selection, **Aubergine** for typographic contrast. Everything else is paper, ink, or hairline.

### Primary — Honey Amber
- **Honey** (`oklch(0.65 0.146 60)`): Focus rings, active service button, method chips when active, brand-moment accents. Use sparingly — the accent's rarity is the point.
- **Burnt Amber** (`oklch(0.48 0.155 60)`): The darker amber used as the filled button background (`primary-strong`). Paired with Bone-white text at ~4.7:1, passes AA for body text.
- **Burnt Amber Hover** (`oklch(0.42 0.155 60)`): One step deeper, the explicit hover state. No opacity tricks.

### Secondary — Aubergine
- **Aubergine** (`oklch(0.32 0.10 340)`): Typographic contrast — links, code callouts, secondary text accents. Distinct in hue and lightness from Honey so they read as two voices, not two variants.

### Neutral — Paper and Ink
- **Paper** (`oklch(1 0 0)`): The body. Pure white, no hidden warmth.
- **Ink** (`oklch(0.18 0.020 60)`): Near-black body text with a brand undertone. ~16:1 contrast against Paper.
- **Pale Paper** (`oklch(0.97 0.005 60)`): Sidebar panels and ghost-button hover. Same hue as Paper, lifted by 3%.
- **Graphite** (`oklch(0.45 0.012 60)`): Muted secondary text. ~5:1 against Paper, AA pass.
- **Hairline** (`oklch(0.90 0.008 60)`): The 1px border between surface and content. Structural, not decorative.

### Semantic
- **Pine** (`oklch(0.50 0.13 145)` + `-bg`, `-foreground`): Success status — 2xx responses, "fill sample" confirmation.
- **Warning Amber** (`oklch(0.48 0.155 60)` + `-bg`, `-foreground`): Warning status — 3xx, redirects, attention-needed without alarm.
- **Vermillion** (`oklch(0.50 0.20 25)` + `-foreground`): Destructive — 4xx/5xx, validation failure, the only red in the system.
- **Slate Blue** (`oklch(0.40 0.10 240)` + `-bg`, `-foreground`): Info — auth prompts, neutral status, "this is just metadata."

### Named Rules
**The Two Voices Rule.** Honey and Aubergine are the only chromatic colors. Honey speaks for action (a button to press, a state that matters). Aubergine speaks for reference (a link to follow, a value to read). Never both at once on the same element.

**The Rarity Doctrine.** The Honey accent covers ≤10% of any given screen. Its scarcity is what makes it meaningful. When in doubt, leave it out — Ink on Paper is enough.

## 3. Typography

**Display + Body Font:** Inter (loaded via `next/font/google`, with `system-ui` fallback).
**Mono Font:** `ui-monospace, SF Mono, JetBrains Mono, Menlo, Consolas` — the system mono stack, no Google Font.

**Character:** Inter is the system's quiet typographic workhorse — readable at 12px body, sharp at 20px display. Mono steps in for the things that look right in mono (verbs, paths, JSON) and stays out of everything else. No display font pair, no flourishes.

### Hierarchy
- **Display** (`Inter 600, 1.25rem, -0.01em tracking`): Panel titles ("Request Builder", "Response"). Sentence case, never all-caps. Tight tracking for sharpness.
- **Headline** (`Inter 600, 1rem`): Service names, sidebar service list primary text. Used at most once per row.
- **Body** (`Inter 400, 0.875rem, 1.5 line-height`): Default UI body. Schema and response JSON use the mono variant.
- **Label** (`Inter 500, 0.8125rem`): Form field labels, button text, service-method chips. The workhorse of the UI.
- **Mono** (`ui-monospace 400, 0.8125rem, ligatures off`): HTTP verbs (uppercased in display), service paths, request bodies, response JSON, response status codes, the page title service suffix. Always `font-feature-settings: 'liga' 0, 'calt' 0` to disable pretty ligatures.

### Named Rules
**The Mono Discipline.** Mono is for code-shaped text only. Body prose, labels, and titles stay in Inter. Mixing them dilutes the terminal vocabulary.

**The No All-Caps Rule Except in Mono.** Display and label text use sentence case. The only all-caps text in the UI is mono — HTTP verbs, method chips — because that's what all-caps means in this system.

## 4. Elevation

The system is **flat by default**. Surfaces do not lift; they sit at the same plane as their container. Depth is conveyed by hairline borders, not shadows.

Cards live on `Paper` (`oklch(1 0 0)`) with a 1px Hairline border (`oklch(0.90 0.008 60)`) and 6px corner radius. They do not cast shadows. They are pages in a notebook, not islands floating in space.

A single soft ambient shadow is permitted in one place: the mobile sidebar drawer, which floats above the page content while open. Defined as `0 4px 24px oklch(0 0 0 / 0.08)` — diffuse and small.

### Shadow Vocabulary
- **drawer-ambient** (`0 4px 24px oklch(0 0 0 / 0.08)`): Mobile sidebar drawer only.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. A shadow is a signal that the surface is floating above the page — that means it's modal, drawer, or popover. If it isn't, it doesn't have a shadow.

**The Hairline Doctrine.** 1px borders separate surfaces. 2px borders are reserved for active tab indicators. No thicker colored border on any element.

## 5. Components

Each component leads with character, then specifies shape, color, states.

### Buttons
- **Shape:** 4px corner radius. Compact on desktop (h-9 / h-10), 44px minimum on coarse pointers (mobile/tablet) via `@media (pointer: coarse)`.
- **Primary:** Burnt Amber bg, Bone text. Hover deepens to Burnt Amber Hover (no opacity). Disabled state at 50% opacity.
- **Outline:** Paper bg, 1px Input border, Ink text. Hover: Pale Paper bg.
- **Ghost:** Transparent bg, Ink text. Hover: Pale Paper bg.
- **Link:** Ink text with 0.04em underline offset. No button chrome.

### Inputs
- **Style:** 1px Input border, Paper bg, 4px radius. Body 0.875rem, mono when input is JSON-shaped.
- **Focus:** 2px Ring (Burnt Amber) outside the border, with `outline-none` — the ring replaces the default browser outline.
- **Disabled:** Muted bg, Graphite text, no cursor.

### Cards / Containers
- **Corner Style:** 6px radius (`--radius`).
- **Background:** Paper. Never a tinted surface.
- **Border:** 1px Hairline on all sides.
- **Internal Padding:** 1.5rem (`p-6`).

### Method Chips
- **Style:** 2px radius, mono font, uppercase HTTP verbs (`FIND`, `GET`, `CREATE`, `PATCH`, `REMOVE`).
- **Default state:** Muted bg, Graphite text.
- **Active state:** Bone-on-Burnt-Amber when their parent button is selected (`bg-primary-foreground/15 text-primary-foreground`).

### Status Badges
- **Shape:** 2px radius, mono font, 12px, paired with plain-language summary text underneath.
- **Success (2xx):** Pine bg + Pine text.
- **Warning (3xx, etc):** Warning Amber bg + Warning Amber text.
- **Danger (4xx, 5xx):** Vermillion/10 bg + Vermillion text. Filled badge reserved for inline destructive controls.

### Navigation (Sidebar + Header)
- **Sidebar:** 320px wide on `md+`, drawer on `<md`. Hairline right border. Service rows are buttons (not anchors), full-width, 44px tall minimum.
- **Header:** 1px bottom Hairline, Paper bg. Page title (Display weight), service name as subtitle.
- **Active state:** Selected service row fills with Burnt Amber. Selected border is implicit (fill color carries the state).

### Tabs (Mobile)
- **Shape:** 2px bottom border on active tab (Burnt Amber), transparent on inactive.
- **Style:** Sentence case label, 14px, semibold. Mono disabled here — tabs are navigation chrome, not verbs.

### Response Header Bar
- **Style:** Status code (`200`, `404`) + status text (`OK`, `Not Found`) in mono, badge-styled to its tone. Plain-language summary sentence below: "Not authenticated. Check your token." / "Validation failed. Check the request body."

## 6. Do's and Don'ts

### Do:
- **Do** use Honey on action elements (filled buttons, active selections, focus rings) and nowhere else. The accent's rarity is the point.
- **Do** use Aubergine for typographic moments (links, code callouts, secondary text accents) — never alongside Honey on the same element.
- **Do** reserve mono for code-shaped content: HTTP verbs, service paths, JSON, IDs, status codes. Use Inter for everything else.
- **Do** pair every status badge with a plain-language summary sentence below it. Color alone never carries the meaning.
- **Do** enforce 44×44px touch targets on coarse pointers via `@media (pointer: coarse)` — already wired in `globals.css`.
- **Do** anchor the input border to `Input` (`oklch(0.90 0.008 60)`) and the focus ring to `Ring` (`oklch(0.48 0.155 60)`). The focus ring replaces the browser outline, never supplements it.
- **Do** use the `dark` token set for night mode — the palette is rebuilt, not inverted.

### Don't:
- **Don't** use the stock shadcn blue (`oklch(0.55 0.20 250)` and neighbors). It is the explicit anti-reference and has no place here.
- **Don't** use SaaS cream gradients, Notion pastel gradients, or any tinted near-white body background. The body stays pure white. Always.
- **Don't** ship Postman-style information overload. Density is fine; chaos is not. One summary per panel, not three.
- **Don't** use emoji as empty-state illustration. Empty states teach the next action in mono copy, not a smiling wrench.
- **Don't** use Tailwind UI look-alike marketing templates. This is a tool, not a landing page.
- **Don't** add a shadow to anything that isn't a modal, drawer, or popover. The flat-by-default rule is non-negotiable.
- **Don't** use side-stripe borders (`border-l` / `border-r` greater than 1px as a colored accent). Use full hairline borders, background tints, or leading glyphs.
- **Don't** use opacity (`/90`, `/80`) on hover states. Use an explicit darker token. Alpha creates unpredictable contrast.
- **Don't** gate content visibility on a class-triggered transition. Reveal animations enhance an already-visible default; they don't create it.
