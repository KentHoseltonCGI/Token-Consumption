# Token Consumption Pipeline - Context Files

## Overview

This directory contains the context documentation for the Nexus Design Token Consumption Pipeline project. These files provide a comprehensive understanding of the project's architecture, implementation plan, and technical decisions for both human developers and AI agents working on this codebase.

## Purpose

The Token Consumption Pipeline transforms design tokens from Tokens Studio (Figma plugin) format into platform-specific consumable formats. This enables design system consistency across web, mobile, and other platforms by automating the distribution of design decisions as code.

### Problem Space

Design tokens created in Figma using Tokens Studio need to be:
- Validated and transformed for multiple platforms
- Distributed with proper versioning
- Integrated into various codebases (Web, iOS, Android, React Native, etc.)
- Kept in sync across all consuming applications
- Documented for developer consumption

## Documentation Structure

### Core Documents

**⚠️ READ FIRST:**

0. **[CONSTRAINTS.md](./CONSTRAINTS.md)** ⭐ **CRITICAL - READ FIRST**
   - **Non-negotiable project constraints and execution rules**
   - Designer-first principles
   - Technology choices (locked for MVP)
   - Unit normalization policies (opacity, font weight)
   - Execution discipline for AI agents
   - **This document takes precedence over all others**

Then review in order:

1. **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)**
   - Project purpose and goals
   - Current state of source tokens
   - Success criteria and next steps
   - Technology stack decisions

2. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - System architecture and data flow
   - Token organization hierarchy
   - Build pipeline design
   - File structure and conventions

3. **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)**
   - Detailed phase-by-phase implementation roadmap
   - Task breakdown and timelines
   - Testing strategy
   - Risk mitigation

4. **[TOKEN_ANALYSIS.md](./TOKEN_ANALYSIS.md)**
   - Source token structure analysis
   - Token types and relationships
   - Transformation requirements

5. **[DECISIONS.md](./DECISIONS.md)**
   - Technical decision tracking
   - Open questions
   - Assumptions to validate

6. **README.md (this file)**
   - Context file overview and navigation
   - Quick start for contributors
   - How to use these documents

## For AI Agents

### ⚠️ CRITICAL: Execution Rules

**Before doing ANYTHING, read [CONSTRAINTS.md](./CONSTRAINTS.md) in full.**

When working on this project, you **MUST**:

1. **Read CONSTRAINTS.md FIRST** - Non-negotiable rules and principles
2. Identify and state the current project phase
3. Confirm you understand the Designer-First Rule
4. Make small, reviewable changes only
5. Never refactor source token files
6. Handle normalization in build layer only

### Required Reading Order

1. **[CONSTRAINTS.md](./CONSTRAINTS.md)** ⭐ **MANDATORY FIRST**
2. **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Project purpose and goals
3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design
4. **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Development roadmap
5. **[TOKEN_ANALYSIS.md](./TOKEN_ANALYSIS.md)** - Token structure
6. **Source tokens** in `Nexus-Source-Tokens/tokens/`

### Mandatory Behavior

AI agents **MUST**:
- ✅ Identify current phase before making changes
- ✅ State last completed step
- ✅ Propose ONE next step only
- ✅ Execute only that step
- ✅ Stop and wait for confirmation

AI agents **MUST NOT**:
- ❌ Refactor source tokens
- ❌ Reformat unrelated files
- ❌ Introduce abstractions "for later"
- ❌ Solve multiple phases at once
- ❌ Rewrite configs wholesale

### Key Concepts to Understand

- **Design Tokens:** Named design decisions (colors, spacing, typography) stored as data
- **Token Hierarchy:** Primitive → Alias → Semantic → Platform-specific
- **Designer-First:** Designers update JSON, never touch build logic
- **Normalize, Don't Refactor:** Handle quirks in build layer, source is read-only
- **Multi-platform:** One source of truth, multiple output formats
- **Token References:** Tokens can reference other tokens (aliasing)
- **Themes:** Light/dark mode and brand variations

## For Human Developers

### Quick Start

1. Review [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) to understand project goals
2. Study the token structure in `Nexus-Source-Tokens/tokens/`
3. Follow [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for development roadmap
4. Refer to [ARCHITECTURE.md](./ARCHITECTURE.md) when making design decisions

### Contributing

When contributing to this project:
- Keep context files updated with architectural decisions
- Document any changes to token structure or pipeline
- Update implementation plan as tasks are completed
- Add examples and integration guides as platforms are supported

## Project Status

**Current Branch:** `setup`  
**Current Phase:** Phase 1 - Research & Analysis  
**Focus:** Configuring project context and creating implementation plan

### Recent Updates
- Created comprehensive project documentation
- Defined system architecture
- Outlined 10-phase implementation plan
- Documented token hierarchy and transformation pipeline

## Source Token Information

### Token Organization
```
Nexus-Source-Tokens/tokens/
├── $metadata.json          # Token set order configuration
├── $themes.json            # Theme definitions
├── 01 Primitive ✅/        # Base tokens (colors, sizes)
├── 01 rem ✅/              # Rem-based sizing
├── 02 Alias ✅/            # Brand aliases (myQ, Community, LiftMaster Pro, Enterprise)
├── 03 Palette ✅/          # Light/dark theme palettes
├── 03 Mapped ✅/           # Semantic mappings
└── 03 Responsive ✅/       # Breakpoint-specific tokens
```

### Token Flow
```
Source (Figma/Tokens Studio)
        ↓
Parser & Validator
        ↓
Transformation Engine
        ↓
Platform Formatters (CSS, Swift, XML, etc.)
        ↓
Distribution Packages
```

## Technology Considerations

### Potential Tools Under Evaluation
- **Style Dictionary:** Industry standard for token transformation
- **Token Transformer:** Tokens Studio format converter  
- **TypeScript:** Type-safe transformation logic
- **Node.js:** Build system runtime

### Target Output Formats
- Web: CSS Variables, SCSS, JavaScript/TypeScript
- iOS: Swift structs/enums
- Android: XML resources
- JSON: Design Token spec, API formats

## Next Steps

1. Complete detailed analysis of all token files
2. Define exact output specifications for each platform
3. Select transformation tooling (Style Dictionary vs custom)
4. Initialize project with dependencies and configuration
5. Begin implementation of core parsing and validation logic
