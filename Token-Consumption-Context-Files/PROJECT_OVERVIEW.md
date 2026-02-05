# Token Consumption Pipeline - Project Overview

## Project Purpose

This project implements a comprehensive design token consumption pipeline for the Nexus Design System. It transforms design tokens from their source format (Tokens Studio/Figma) into consumable formats for multiple platforms and frameworks.

## Current State

### Source Files
- **Location:** `Nexus-Source-Tokens/tokens/`
- **Format:** JSON files organized by token type and theme
- **Token Categories:**
  - **01 Primitive ✅:** Base design tokens (colors, spacing, typography primitives)
  - **01 rem ✅:** Rem-based sizing tokens
  - **02 Alias ✅:** Brand-specific token aliases (myQ, Community, LiftMaster Pro, Enterprise)
  - **03 Palette ✅:** Theme palettes (light, dark)
  - **03 Mapped ✅:** Mapped semantic tokens
  - **03 Responsive ✅:** Responsive breakpoint tokens (Mobile, Larger Breakpoint)

### Token Set Structure
The `$metadata.json` defines the order of token sets:
1. Primitive tokens (Mode 1)
2. Rem-based tokens (Mode 1)
3. Brand aliases (myQ, Community, LiftMaster Pro, Enterprise)
4. Palettes (light, dark)
5. Mapped tokens (Mode 1)
6. Responsive tokens (Mobile, Larger Breakpoint)

## Project Goals

**⚠️ Note:** This is an **MVP proof of concept**. See [CONSTRAINTS.md](./CONSTRAINTS.md) for scope boundaries.

### MVP Scope (Included)
1. **Ingestion:** Load tokens from Tokens Studio JSON exports
2. **Normalization:** Handle authoring quirks (opacity 0-100 → 0-1, font weight strings → numbers)
3. **Selection/Scoping:** Build single brand or mode at a time
4. **Output:** Generate `tokens.css` with CSS variables
5. **Consumption:** Enable UI components to consume generated tokens

### Designer-First Workflow
The pipeline must support:
1. Designer exports tokens from Figma (Tokens Studio)
2. Designer drops JSON files into repo
3. Build command runs
4. CSS variables generated automatically
5. **No designer intervention in build logic required**

### Future Phases (Explicitly Deferred)
- Multi-platform outputs (iOS Swift, Android XML, React Native)
- Full typography token composition
- Multi-brand merging
- Component-level tokens
- Advanced documentation generation
- Automated versioning and changelog

**Deferred ≠ ignored. These features are not blocking MVP output.**

## Technology Stack (Locked for MVP)

**⚠️ These choices are locked. See [CONSTRAINTS.md](./CONSTRAINTS.md) for rationale.**

### Confirmed Tools & Libraries
- **Node.js (v18+):** Runtime environment
- **npm:** Package management
- **Style Dictionary (v5+):** Industry-standard token transformation
- **@tokens-studio/sd-transforms:** Tokens Studio compatibility layer
- **JSON:** Token input format (DTCG-style)
- **CSS Variables:** Primary output format
- **TypeScript:** Type-safe build tooling (optional for transforms)

### Explicitly Deferred
- Multi-platform outputs (iOS, Android) - Phase 4+
- Advanced testing frameworks - After MVP
- Documentation generators - After MVP
- Component-level tokens - After MVP

## Success Criteria

1. Automated pipeline transforms source tokens to all target formats
2. Platform teams can consume tokens without manual intervention
3. Token updates propagate to all platforms consistently
4. Clear documentation for token usage and integration
5. Versioned releases with comprehensive changelogs

## Next Steps

1. Analyze token structure and relationships in detail
2. Define exact output format specifications
3. Select and configure transformation tooling
4. Create proof-of-concept for one platform
5. Expand to all target platforms
