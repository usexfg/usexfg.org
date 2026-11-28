# Fuego Reserve — design system

The record of what this site has decided. `PRODUCT.md` says what the brand is for;
this file says how it is built, so the next page starts from the same place instead
of inventing a fifth gold.

**Source of truth, in order:** `style.css` tokens and rules → the markup that uses
them → this document. Where the two disagree, the CSS is the fact and this file is
the bug. Values below are the ones the build renders, not aspirations.

Scope: `index.html`, `answers.html`, `parked-capital.html`, `404.html`.
`questions.html` is a redirect stub and carries no chrome.

---

## 1. Visual thesis

Obsidian ground, one champagne accent, a Garamond display voice against a mono
machine voice, and a single 2px bezel edge. Weight comes from material and
subtraction: no glass, no gradient text, no orbs, no rounded card clouds.
The page should read as a ledger printed on dark stock, not as a product launch.

---

## 2. Palette

One accent. Gold is load-bearing: it marks what is true (values, labels, rules,
the italic clause of a heading). Nothing else competes with it.

### Surfaces

| Token | Value | Role |
|---|---|---|
| `--obsidian` | `#0A0A0A` | page ground, hero, full-screen galaxy |
| `--panel-bg` | `#111110` | bezel face, every `.section` |
| `#0C0C0B` | nav surface | one step above the ground |
| `--obsidian-soft` | `#1C1C1C` | recessed wells: `code`, inline mono |

### Accent

| Token | Value | Role |
|---|---|---|
| `--gold` | `#C5A059` | headings' italic clause, icon strokes, hover edges, links |
| `--gold-dim` | `#A8A080` | 10–11px labels, stat labels, quiet links |
| `--gold-glow` / `--gold-glow-soft` | `rgba(197,160,89,.12/.06)` | hover shadow, atmosphere only |
| `--ember` | `#E8622C` | one place: the CD card's top rule |
| `--flame-aqua` | `#9FD4DE` | one place: the Hearth card's top rule |

`--ember` and `--flame-aqua` exist so the CD and Hearth cards can be told apart
by their head rule; the other HEAT and accrual cards carry the gold rule. Do not
promote either colour to buttons, links, or headings.

### Text ramp — three levels, and no fourth

| Token | Value | Use | On `#111110` |
|---|---|---|---|
| `--flame-white` | `#EAF6F9` | display, headings, values | 17.1:1 |
| `--stone-300` | `#B5B5B5` | lede, body default | 10.4:1 |
| `--stone-500` | `#9A9A9A` | secondary body, meta, mono labels | 6.3:1 |

Rules:

- Four greys is the failure mode. If a new element needs "slightly quieter",
  it is `--stone-500`; there is no fifth step and no `/70` opacity variant.
- `--gold-dim` on panel is 7.4:1. It is the quietest thing allowed to carry text,
  and it must be measured again if the panel value ever changes.
- Never pure black, never pure white. `#000` is gone; the darkest value in the
  build is `#030302` inside the hero vignette.

---

## 3. Typography

Three families, one job each.

| Family | Role | Loaded weights |
|---|---|---|
| Cormorant Garamond | display, headings, large numbers | 300, 400, 600 + 300/400 italic |
| Golos Text | body, UI copy, table labels | 400, 500, 600 |
| IBM Plex Mono | machine voice: specs, ports, status, labels, code | 400, 500 |
| EB Garamond | ΗΞΔŦ glyphs only (Cormorant has no Ξ or Η) | 400, 500 |

Mono means **a value a machine produced or checks**: ports, supply, addresses,
file paths, state tags, the specs ledger's right column. It does not mean
"label" in general — but on this site labels are short caps at 10–11px, which is
the one place mono is allowed to carry prose-adjacent text.

### Display scale

| Element | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| Hero `h1` | `clamp(3rem, 7vw, 6rem)`, `min(7vw, 9.5vh)` on short viewports | 300 | 1.0 | −0.01em |
| Section `h2` | `clamp(2.2rem, 4.5vw, 3.8rem)` | 300 | 1.1 | 0.01em |
| R&D headline | `clamp(1.8rem, 3vw, 2.6rem)` italic | 300 | 1.15 | — |
| Answers `h1` | `clamp(2.6rem, 6vw, 4.2rem)` | 300 | 1.06 | 0.01em |
| Answers `h2` | `clamp(1.5rem, 3.2vw, 2rem)` | 400 | 1.2 | 0.01em |
| Parked `h1` | `clamp(3rem, 7vw, 5.5rem)` | 300 | 1.02 | 0.01em |
| Parked `h2` | `clamp(1.75rem, 3.8vw, 2.5rem)` | 400 | 1.15 | — |
| Pillar `h3` | 24px | 600 | 1.35 | 0.02em |
| Eco card `h3` | 22px | 600 | 1.35 | 0.02em |
| R&D column `h3` | 20px, gold | 600 | 1.3 | 0.04em |
| Wallet `h3` | 17px mono | 500 | — | 0.02em |
| R&D item `h4` | 14px Golos | 500 | — | 0.01em |

Body scale: 16px/1.7 base; 17px/1.7 lede; 15px/1.7 inside cards; 17px/1.75 on
Answers (64ch); 16px/1.8 on Parked (78ch). Nothing below weight 400 — the old
300-weight `rd-item` paragraphs were synthesising and are gone.

### Casing, everywhere

- **Sentence case** for headings, buttons, nav items, and section labels written
  in the body voice (`The Vault.`, `Answers, plainly.`, `Acquire Wallet`).
- **Uppercase** only for 10–11px machine labels: `.section-label`, `.status-tag`,
  `.wallet-type`, the specs ledger label column, footer links, nav items.
- Italic carries exactly one thing: the clause of a heading that gold completes
  (`Sound Money / *does not ask permission.*`). One per page section, never as
  flavour on every heading.
- No Title Case headings, no mixed conventions inside one page.

---

## 4. Space and layout

- Container: `max-width: 1100px`, 32px gutters (24px under 768px).
- Reading pages are narrower and set their own measure: Answers 780px / 64ch,
  Parked 1040px / 78ch.
- Section rhythm: 120px block padding (80px under 768px), `min-height: 100vh`
  so each section is one screen on the desktop pager.
- Card padding 36px; R&D column 32/40px; 24/20px on mobile.
- Grid gaps: 24px (wallet, eco), 28px (pillars), 56px (R&D columns).
- Hero: 120/32/80 padding, 700px text column, stats strip 80px below. On
  short viewports (`≤700px` tall, or `≥1100px` wide and `≤820px` tall) it goes
  to 96/32/32 padding, 16/20/24/32 gaps, a 560px text column with a 16px sub,
  and 16/32 stat padding, so the CTA and stat strip stay above the fold.
- Group with space before adding a rule. Divider hairlines appear only where
  rows must be scanned (specs ledger, sources list, footer top), never around
  a group that padding already separates.

**Two scroll models.** Under `(min-width: 861px) and (pointer: fine)` the home
page is a full-screen pager: sections are absolutely positioned, cross-fade over
0.9s, and are driven by wheel, key, dot, and swipe. Everywhere else it is one
native document with `IntersectionObserver` reveals. `answers.html` and
`parked-capital.html` always scroll natively; the pager is scoped by
`html.home-page`. Crossing the breakpoint reloads, because the two models own
the scroll container differently.

---

## 5. Edge, depth, elevation

| Token | Value |
|---|---|
| `--bezel-outer` | `1px solid rgba(150,145,135,.26)` — grey-champagne rim |
| `--bezel-inner` | `1px solid rgba(234,246,249,.03)` — inset hairline, `inset: 1px` |
| `--bezel-radius` | `2px` |

- **One radius.** 2px for every panel, button, tag, overlay, and input. `0` for
  rules, table cells, and the metadata rows. `50%` only for circular marks
  (logo, coin nodes, galaxy core, page dots).
- Panels get the outer rim plus a `::after` inner hairline. That double bezel is
  the house edge and is not repeated on open columns.
- Elevation: no drop shadows on content. The nav carries one soft shadow
  (`0 10px 30px rgba(0,0,0,.45)`) plus a 1px inset highlight; cards lift only by
  edge colour and a gold-glow shadow on hover.
- Depth layers, in paint order: grain `body::after` → `#three-canvas` →
  `.section-atmos` → galaxy/HEAT title → content. `data-depth="1|2|3"` drives
  pointer parallax (strength `(4−depth)×3`px) and scroll drift
  (`(1−speed)×80`px at speeds 0.25/0.5/0.8).

---

## 6. Components

| Component | Class | Rule |
|---|---|---|
| Nav | `.nav-surface` | fixed, 90% / 1100px, 60px tall, mark left, 8 items spread evenly |
| Footer | `footer` | top rule only, three columns, no box |
| Primary button | `.btn-primary` | gold fill, obsidian text, uppercase mono 11px |
| Ghost button | `.btn-ghost` | 1px grey rim, `--gold-dim` text |
| Small button | `.btn-sm` | 10px mono, 22px side padding |
| Bezel panel | `.wallet-card`, `.eco-card`, `.rd-column` | see §5; 36px padding |
| Open column | `.pillar` | cardless: icon, `h3`, paragraph, meta row |
| Metadata row | `.pillar-detail`, `.eco-detail`, `.wallet-features` | 10px mono, uppercase, middot separated, no boxes |
| State tag | `.status-tag` | "Arriving with v11" — the only bordered tag, because it marks unreleased work |
| Specs ledger | `.specs-table` | no card, 1px gold-tinted rules, mono right column |
| Quiet link | `.inline-link` | 12px mono uppercase, gold, hairline underline |
| HEAT wordmark | `.heat-glyph` | EB Garamond 500, gold, 1.05em |
| Galaxy | `#xfg-galaxy` | self-contained 3D scene; own HUD, own palette values, gold-dim labels |

Pillars, wallet cards, eco cards, and R&D columns are the four content shapes.
A new section picks one of them; it does not invent a fifth box.

---

## 7. Motion

| Move | Spec |
|---|---|
| Easing | `--ease-out: cubic-bezier(.16,1,.3,1)`; `--ease-in-out: cubic-bezier(.45,0,.15,1)` |
| Hero entrance | fade-up 20px, 0.8s, staggered 0.1 / 0.3 / 0.48 / 0.62 / 0.78s |
| Reveal | fade-up 18px, 0.7s, nth-child +80/160/240ms |
| Pager | 0.9s cross-fade, 750ms input cooldown |
| Hover | 0.2–0.3s edge/text colour; `translateY(−2px)` on buttons only |
| Marquee | 28px/s, alternating direction by line |
| Ambient | grain, starfield, hearth canvas, slow orbit rings |

`prefers-reduced-motion: reduce` kills every animation, transition, scroll
behaviour, the starfield, the parallax, and the marquees (the marquee script
returns early). Nothing that carries information moves.

Do not add a pulsing glow, a live-status dot, or a looping attention cue. The
hero's old 8s `glowPulse` was removed for exactly this reason: motion was being
used to hold the eye, not to show state.

---

## 8. Voice

From `PRODUCT.md`, applied to UI strings:

- Declarative sentences. Statements, not persuasion. No urgency, no badges,
  no social proof, no exclamation.
- Say each fact once. The four numbers in the hero are the same four numbers in
  the specs ledger; that repetition is the ledger proving the poster, not a
  second claim.
- Machine-facing language belongs in a file, not on the page: no `AUDIENCE:`
  lines, no "this section explains", no design commentary.
- "Arriving with v11/v12" is the shipping-truth convention. Never describe an
  unshipped mechanism in the present tense.

---

## 9. Page continuity contract

Every page ships the same seven things. Divergence here is the bug that reads
as "generated", because it is the chrome a reader sees first.

1. `<body class="chiaroscuro">` — the house light.
2. `style.css?v=37` on all four pages, one version number, bumped together.
3. Fonts: the same Google Fonts request (Cormorant + EB Garamond + IBM Plex Mono
   + Golos). A page that drops EB Garamond breaks the ΗΞΔŦ glyph.
4. Nav: identical eight items in identical order —
   Reserve · Vault · Exchange · Accrual · Specs · Answers · R&D · ΗΞΔŦ.
   Interior pages prefix section links with `index.html#`. The nav and the
   footer carry the mark alone — no "Fuego Reserve" lettering; the name lives in
   the page title, the hero eyebrow and the `h1`. The links take the width the
   wordmark used to hold and spread evenly across it (`space-evenly` in the nav,
   `flex: 1` + `space-evenly` in the footer row).
5. Footer: mark alone, the eight external links spread evenly across the row —
   GitHub · Discord · Explorer · Bitcointalk · 𝕏 · Answers · Docs · ΗΞΔŦ, with
   ΗΞΔŦ last, as in the nav — and `₲ 8,000,008` in mono. Both rows give the
   ΗΞΔŦ link EB Garamond at `--gold-dim`; only the nav sets its own size.
6. Skip link as the first focusable element, pointing at `#main-content`.
7. `<meta name="viewport">`, favicons, canonical, and `theme-color: #0A0A0A`.

Anything numeric must match the ledger: 8,000,008 XFG, 480s, 7 decimals,
ports 10808 / 18180, decoy mixin 32 | 16 | 8.

---

## 10. Accessibility commitments

Measured against the tokens, not assumed:

- Text contrast on panel: 17.1:1 / 10.4:1 / 6.3:1 for the three ramp levels;
  `--gold-dim` 7.4:1; gold on panel 7.8:1; obsidian on gold 8.2:1. All pass AA
  at the sizes used, including 10px uppercase labels.
- Focus: one 2px gold ring at 3px offset on every interactive element;
  `.skip-link` is the first tab stop on every page.
- No meaning by colour alone: chain identity always carries a text label.
- Reduced motion is honoured sitewide (§7).
- Tap targets: nav toggle 44px; galaxy withdraw 44px min-height; footer links
  16px vertical padding (8px on mobile).

---

## 11. Documented exceptions

These are decisions, not drift. Leave them unless the reason changes.

- **Parked Capital's `01`–`11` section numbers** are real: the prose refers to
  "section 10" and "section 06" by number, so the rail is navigation.
- **File paths in Parked Capital's `.pc-source` notes** (`src/CryptoNoteCore/…`)
  are the proof the page exists to give auditors, not decoration.
- **`--ember` / `--flame-aqua`** appear once each, as card head rules: ember on
  the CD card, aqua on the Hearth card. The flatcoin, fee, and other cards use
  the gold rule.
- **The galaxy HUD** carries its own hard-coded palette inside `style.css`
  because it must match the WebGL scene; it still uses `--gold` and `--gold-dim`.
- **The R&D marquee** is a running manifesto, not a section heading: eight
  italic lines at up to 1.6rem, the busiest block on the site. Its sentences are
  declarative; the register is what stands apart, not the grammar. It is the
  only sustained statement of intent on the site, so it stays.
- **The accrual fee card states the route, not the split.** Hearth fees are
  named by destination — the ΗΞΔŦ pairing position, makers, certificates — and
  the 35/35/30 split lives in Parked Capital §08 and §11, where branch status is
  already tracked. No rate, share, or APY appears on the reserve page; those
  numbers move with the branch and would date the page.
- **The hero is content-height, not screen-height.** Above the short-viewport
  query it measures about 959px at 1440×900 (the display heading wraps to three
  lines at 96px) and 815px at 1024×768. All of that content still lands above
  the fold at both sizes, so the taller hero is kept there — the composition is
  the poster, and 959px of it on a 900px screen is intentional. Below the
  query the heading size answers to viewport height, and the hero measures
  exactly one screen: 640px tall at 1366×640, with the CTA at 451 and the stat
  strip ending at 582.

---

## 12. What this pass changed

Fixes applied to the build (the "generated" tells, not the art direction):

| Tell | Fix |
|---|---|
| Unterminated comment ate the `.card` rule, so panels had no border | Rebuilt as one `BEZEL SURFACES` rule; `.card` is no longer a dead selector |
| Two card systems: 2px bezels under 24px "RESTORE CARD STYLES" overrides, plus a 40px pill nav and a 12px nav radius | One radius scale: 2px, `0` for rules and rows, `50%` for marks |
| Nine metadata rows of bordered pills | Unboxed middot rows, one shared rule |
| Hero CTA and stat strip fell below the fold on a 640px-tall laptop, and the 7vw heading overran 700–820px-tall ones by wrapping to three lines | Height-aware hero: `min(7vw, 9.5vh)` heading, tighter rhythm under `(≤700px tall)` / `(≥1100px wide and ≤820px tall)`; 1440×900 and 1024×768 unchanged |
| `.hero-glow` was a 700px box that clipped its own vignette into a faint rectangle | `inset: 0`; measured equal to the hero at 1440, 1024, and 1366 |
| Accrual's second card repeated HEAT's Hearth Floor paragraph | `.eco-fees`: the fee route behind CD accrual, stated by destination, not rate |
| Five eyebrow labels for seven sections | Two, the ones whose heading cannot say it |
| Four `eco-tag` labels, one of which duplicated its own chip row | Removed; the meta row carries it |
| `fire-text` class re-declaring `.pillar h3` | Removed from markup and CSS |
| Broken brand lockup: `href="#"` and an empty `<span>` in the home nav | `#hero` + the mark, matching every other page |
| "Fuego Reserve" lettering beside the mark in nav and footer, taking a third of the nav's width and sitting in the footer's left cell | Mark alone; the eight nav items and eight footer links spread evenly across the freed width |
| Footer boxed inside a bordered footer | Footer is a rule and a row |
| Second palette (`#A8A080`, `#E4E0D8`, `#6F6B60`, four greys) layered as `.chiaroscuro` overrides | Folded into tokens; the class now holds only structural overrides |
| Label gold at 5.6:1 under 10px caps | `--gold-dim` → `#A8A080`, 7.4:1 |
| `#3D3D3D`-level footer text and 300-weight body | Three-level text ramp, minimum weight 400 |
| `style.css?v=24` on two pages, `?v=33` on the third | All four pages at `?v=37` |
| Dead rules (`.spec-val`, `.swap-pairs`, `.swap-steps`, `.ef-arrow`), duplicated `.heat-title-svg`, `.nav-links a`, `.footer-links a` | Removed |
| The footer's ΗΞΔŦ link carried `class="nav-heat"` with no rule matching it, so it rendered as a grey mono item beside seven like it | `.nav-heat` covers both rows: EB Garamond and `--gold-dim`, with the 16px size scoped to the nav |
| `.footer-links a` split across two rules; the nav kept the wordmark's 48px left offset after the wordmark was gone | One `.footer-links a` rule; offset dropped so `space-evenly` centres the eight items |
| Footer listed ΗΞΔŦ second while the nav ends on it | ΗΞΔŦ last in both rows |
| Hard-coded inline palette in `404.html` | Loads `style.css` |
| `XFG maxSupply: 800008` in `data/networks.json` | `8000008` |
| Interior nav swapped R&D for GitHub, which the footer already had | Same eight items on every page |
| Meta-strategy text on the page (`AUDIENCE: AUDITORS, AGENTS, SKEPTICS`) | Removed |

Left as recommendations, because they change content rather than chrome:

1. **The hero stat strip and the specs ledger carry the same four numbers.**
   That is defensible as poster-then-proof, but if the hero ever needs air, the
   strip is the thing to delete — not the ledger.
2. **R&D's headline carries a fantasy cadence** — "Guarding the Shield that
   Guards the Realms of Men" — above a technical column, and "Not a slogan — a
   vow" talks about the register instead of using it. The marquee below is
   manifesto, but every line is a declarative sentence. If the voice is ever
   tightened, change the headline first; the marquee is the site's only
   sustained statement of intent.
3. **`.section` at `min-height: 100vh`** makes seven full screens on desktop;
   Accrual's two cards leave most of its screen empty at that height.
