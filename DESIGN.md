# The Dreamers: design system

Professional and quiet: an editor's dark theme with one safety-orange accent for the thing to do next.
Everything below lives in `src/app/globals.css` (tokens, controls) and `src/app/kit.css` (product-UI fragments).

## Tokens

Dark is the default; the light grade is the palette's inverse (buttons go graphite, orange stays the brand mark).

| Token | Dark | Light |
|---|---|---|
| `--bg` | `#18191b` | `#eff0f1` |
| `--surface` (cards) | `#202225` | `#f8f8f9` |
| `--ink` | `#eff0f1` | `#18191b` |
| `--muted` | `#9c9ea3` | `#5b5c5e` |
| `--accent` (marks, meters) | `#ff4a1f` | `#ff4a1f` |
| `--action` (buttons, focus) | `#ff4a1f` | `#18191b` |
| `--line` / `--line-strong` | ink at 11% / 20% | same |

Stage, behind product pictures: a quiet panel one step off the page with a colourless sheen from its top
edge, in the visitor's theme (dark `--ground-bg #121315`, fragments `#1d1e21`; light `#e4e5e7`, fragments white).
Buttons on a stage use `btn-stage` (orange).

Data colours were checked with the dataviz palette validator for both themes:
difficulty `--easy / --medium / --hard` (dark `#2a9d74 #bd8418 #e2567e`, light `#17855e #a87c06 #c42a5a`)
and the activity ramp `--heat-1..4` (one hue, light to dark). Text never wears a data colour: a
difficulty is a coloured dot beside the word.

## Type, shape, controls

- Onest for display and text (display weight 400, tracking -0.035 to -0.04em); JetBrains Mono for ids and numbers in columns.
- Sizes: `t-h1` 40-72px, `t-h2` 30-48px, `t-h3` 24-28px, `t-lead` 18-20px, body 16px, labels 13px.
- Radius: 4px controls, 6px small panels, 8px cards and frames.
- One button height (44px; `btn-sm` 36, `btn-xl` 64): `btn-primary` (solid), `btn-secondary` (outlined), `btn-ghost`.
  The drawn arrow (`<Arrow />`) grows its stem on hover.
- Header: fixed, opaque, one hairline; the current page has a 2px bar under its word.
- Tabs: the chosen one is the ink. Fields: 44px, hairline border, a soft ring on focus.
- Logo: a geometric D cut from a brand-orange tile (`src/components/brand/logo.tsx`, `src/app/icon.svg`).

## Motion

- One ease-out (`cubic-bezier(.2,.8,.2,1)`), 120-180ms for hover and press; entrances use `cubic-bezier(.22,1,.36,1)`.
- The hero enters once: the headline word by word out of masks, then the lead and the button, the window settling from 0.98.
- Product pictures loop only while on screen and the tab is visible.
  Reduced motion: loops rest on their first frame, the effects draw one still frame, nothing is hidden.
- Liquid type on "Practice smarter, not harder" (pointer only; plain type on touch and reduced motion).
- The company wall (twelve tiles inside the page width) turns one tile over to another company every couple of
  seconds; counts count up once; headings and cards rise in on scroll;
  the statement's words light up as it scrolls through the screen; the hero window leans toward the pointer.

## Rules

- No eyebrow above a heading, no gradients on text, no glow, no decorative backgrounds, no emoji in the interface.
- No invented numbers: counts, lists and frequencies come from the database. The home page's windows show
  real questions with sample ticks and say "Demo".
- Product-UI fragments take the colours of the ground they sit on (`--fx-*`), so a fragment needs no theme class.
