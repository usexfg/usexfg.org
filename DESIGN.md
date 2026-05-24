---
name: Bank of XFG
description: Private blockchain bank with a magnificent, technical aesthetic.
colors:
  primary: "#ff4500"
  primary-dim: "#cc3700"
  blue-glow: "#3b82f6"
  purple-glow: "#a855f7"
  amber-glow: "#f59e0b"
  eth-blue: "#627eea"
  sol-purple: "#9945ff"
  xmr-orange: "#ff6600"
  bch-green: "#0ac18e"
  neutral-bg: "#000000"
  neutral-bg-alt: "#0a0a0a"
  text-main: "#ffffff"
  text-dim: "#737373"
  text-technical: "#525252"
  border: "#262626"
  border-hover: "#404040"
typography:
  display:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "clamp(1.8rem, 1.8vw, 2.0rem)"
    fontWeight: 100
    lineHeight: 1.2
    letterSpacing: "0.1em"
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  technical:
    fontFamily: "DM Mono, monospace"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "1.1em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "12px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.text-main}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-dim}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card-wallet:
    backgroundColor: "{colors.neutral-bg-alt}"
    rounded: "{rounded.lg}"
    padding: "36px"
  card-eco:
    backgroundColor: "transparent"
    rounded: "{rounded.lg}"
    padding: "32px"
---

# Design System: Bank of XFG

## 1. Overview

**Creative North Star: "The Magnificent Vault / The Sovereign Terminal"**

Fuego Bank's visual system balances the grandeur of high-end luxury with the raw precision of a technical terminal. It is a system designed for sovereign individuals who value seclusion and expert control. The aesthetic is monochromatic and "magnificently minimal," using space and typography as primary design elements rather than decorative "fluff." It rejects the rounded, colorful clichés of modern SaaS in favor of a sharp, high-fidelity fintech look.

**Key Characteristics:**
- **Magnificent Minimalism:** Deep black canvases with carefully placed, high-contrast typography.
- **Sovereign Seclusion:** A mood that is calm, exclusive, and impenetrable.
- **Technical Sincerity:** Raw technical data presented with mono-spaced fonts and expanded tracking.
- **Kinetic Precision:** Motion is exponential and purposeful, reflecting a system built on robust engineering.

## 2. Colors

A restrained, high-contrast palette tinted toward the brand hue to avoid absolute flat blacks/whites.

### Primary
- **Fuego Fire** (#ff4500): Used sparingly for accents, labels, and icons to evoke the heat of the network.
- **Fire Dim** (#cc3700): Supporting brand tone for lower-priority accents.

### Ecosystem & Glows
- **Hearth Amber** (#f59e0b): Used for liquidity and fireplace-related themes.
- **Yield Blue** (#3b82f6): Used for cold storage and baseline yield indicators.
- **Staking Purple** (#a855f7): Used for time-locked deposit mechanisms.

### Cross-Chain Assets
- **Solana Purple** (#9945ff): Solana pair indicators.
- **Ethereum Blue** (#627eea): Ethereum pair indicators.
- **Monero Orange** (#ff6600): Monero pair indicators.
- **Bitcoin Cash Green** (#0ac18e): BCH pair indicators.

### Neutral
- **Sovereign Black** (#000000): The core background. Evokes depth and total privacy.
- **Vault Gray** (#0a0a0a): Alternate background for cards and secondary sections.
- **Pure Contrast** (#ffffff): Primary text color for high legibility.
- **Muted Steel** (#737373): Dimmed text for secondary information.
- **Technical Lead** (#525252): Used for labels, mono data, and structural borders.

### Named Rules
**The Rarity Rule.** The Fuego Fire accent (#ff4500) must occupy ≤10% of any view. Its impact comes from its isolation against the monochromatic void.

## 3. Typography

**Display Font:** Orbitron (Heading/Display)
**Body Font:** Plus Jakarta Sans (UI/Content)
**Label/Mono Font:** DM Mono (Technical Data/Stats)

**Character:** A pairing of geometric "high-tech" display type with human-centric body copy, anchored by raw terminal-style labels.

### Hierarchy
- **Display** (100, clamp(1.8rem, 1.8vw, 2.0rem), 1.2): Section headers. All caps, expanded tracking (0.1em).
- **Title** (600, 20px, 1.3): Card headings and pillar titles.
- **Body** (400, 16px, 1.6): Core reading experience. Max line length 65ch.
- **Label** (500, 10px, 1.1em tracking, uppercase): Technical indicators and section labels.

### Named Rules
**The Wide Track Rule.** Section labels (DM Mono) must always use expanded tracking (≥1.0em) to reinforce the terminal-native aesthetic.

## 4. Elevation

The system is flat by default, emphasizing the "screen-on-glass" terminal feel. Depth is conveyed through tonal layering (#0a0a0a surfaces on #000000 backgrounds) and subtle glowing borders rather than traditional drop shadows.

### Shadow Vocabulary
- **Brand Glow** (0px 0px 80px rgba(255, 69, 0, 0.15)): Used exclusively under specific hero headings or signature elements to suggest underlying "heat."

## 5. Components

### Buttons
- **Shape:** Rounded-md (6px)
- **Primary:** High-contrast white background with black text. Refined, not rounded.
- **Ghost:** Border-only (1px solid #262626) with muted text, shifting to white on hover.

### Cards
- **Corner Style:** Rounded-lg (12px)
- **Structure:** 1px solid border (#262626). No background color for ecosystem cards; alternate #0a0a0a for wallet cards.
- **Feature:** "Hearth" cards use a specific gradient top-border matching the primary fire hue.

### Navigation
- **Style:** Fixed, ultra-minimal, backdrop-blur (10px) with 1px border-bottom.
- **Interaction:** Dot-based side nav for section-to-section movement.

## 6. Do's and Don'ts

### Do:
- **Do** use Orbitron strictly for primary section headings.
- **Do** use DM Mono for all technical stats, numbers, and mechanism details.
- **Do** center section labels and headings to maintain the "Magnificent" symmetry.

### Don't:
- **Don't** use "Childish" sci-fi fonts like Audiowide or Chakra Petch.
- **Don't** use gradient text or neon glow effects on body copy.
- **Don't** use border-left stripes for accents; use full borders or top-line gradients.
- **Don't** use rounded-full (pills) for primary UI elements; maintain the precise 6px/12px grid.
