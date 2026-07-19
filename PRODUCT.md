# Product

## Register

product

## Platform

web

## Users

Feathers app developers using the playground during the day while building or debugging a FeathersJS v5 service. They already know what a request is. The tool is a default open tab, not a destination.

## Product Purpose

Shorten the loop between "I have a Feathers service" and "I have a request against it with the right method, schema-shaped body, headers, and auth that actually ran." Success looks like a developer hitting the playground, sending a few requests against a real service, and shipping — without ever leaving the panel.

The playground is also the discoverable surface of the framework for newcomers: a route the host app exposes so the schema is browsable and the API is exercisable without spinning up Postman. Embed-friendly beats external.

## Positioning

Fastest path from schema to working request. Every screen reinforces that the schema is the UI: the sidebar lists services, the body editor pre-fills from schema, the response shows what really happened.

## Brand Personality

**Quiet. Sharp. Considered.** Terminal-adjacent in vocabulary — mono for HTTP verbs and methods, sharp typographic hierarchy, near-white surface, near-black ink. No decoration that doesn't carry information. The tool disappears into the workflow; the developer's attention stays on the request and the response.

Three-word shape: **quiet, sharp, terminal-adjacent**.

## Anti-references

- Stock shadcn starter (current state — generic blue + Inter). Replace with a committed palette.
- SaaS cream / Notion pastel gradients. Not this product.
- Postman-style information overload. Density is fine, chaos is not.
- Playful mascots or emoji as empty-state illustration. The tool is serious; empty states teach the next action, not decorate.
- Tailwind UI look-alike marketing templates. We're a tool, not a landing page.

## Design Principles

1. **Schema-aware speed.** Every screen shortens the path between "I have a service" and "I sent a working request." Schema drives sample fill, method defaults, and visible affordances.
2. **Earned density.** Information-dense where developers need it (method picker, headers, body, response); spacious where they read (status badges, errors, schema).
3. **Honest state.** Real HTTP status, real error messages from the API, real auth flow — no masked NETWORK_ERROR, no synthetic success.
4. **Terminal-adjacent vocabulary.** Monospace for verbs, methods, paths, JSON; sharp hierarchy; no rounded-soft-everywhere. Familiar to the user without being a costume.
5. **Quiet chrome.** Color and motion earn their place. Restraint is the default; emphasis is reserved for primary action, current selection, and live state.

## Accessibility & Inclusion

WCAG 2.2 AA. Body text ≥4.5:1, large text ≥3:1. All interactive controls keyboard-reachable with visible focus. Form fields labeled (htmlFor or wrapping label). Status changes announced via `aria-live`. Respect `prefers-reduced-motion`. No color-only state — status badges pair color with text and icon.
