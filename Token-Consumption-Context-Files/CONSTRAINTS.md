# Design Token Consumption Pipeline - Project Constraints & Execution Rules

## Document Purpose

This document defines the **non-negotiable constraints, rules, and execution discipline** for the Design Token Consumption Pipeline project.

**This document takes precedence over all other suggestions, tool defaults, or convenience refactors.**

It exists to:
- Maintain continuity when resuming work
- Prevent accidental overengineering or destructive refactors
- Provide AI agents (e.g., GitHub Copilot) with explicit operating rules
- Ensure a designer-first, industry-standard design–dev token workflow

**All contributors and AI agents must follow this document.**

---

## 1. Project Goal (Non-Negotiable)

Build a minimal, robust token consumption pipeline where:

1. **Designers author tokens in Figma using Tokens Studio**
2. **Tokens are exported as JSON and dropped into the repo**
3. **A build step converts tokens into correct, usable CSS variables**
4. **Designers can update or replace token JSON files without touching code**
5. **The pipeline handles authoring quirks safely and predictably**

**This is a proof of concept, not a full production system.**

---

## 2. Core Design Principles

### 2.1 Separation of Responsibilities

| Layer | Responsibility | Tools |
|-------|---------------|-------|
| **Authoring** (Design) | Token Studio exports | Figma + Tokens Studio |
| **Consumption** (Build) | Normalization, validation, output | Style Dictionary + transforms |
| **Usage** (UI) | Components consume generated tokens only | CSS/React/etc. |

**These layers must never be merged.**

### 2.2 Designer-First Rule

A designer must be able to:
- ✅ Export tokens from Tokens Studio
- ✅ Replace JSON files in the repo
- ✅ Run the build
- ✅ Get updated outputs

**Without:**
- ❌ Editing build logic
- ❌ Editing token values by hand
- ❌ Understanding Style Dictionary internals

**If a change violates this, it is rejected.**

### 2.3 Normalize, Don't Refactor

- **Source token files are read-only**
- Any inconsistencies, quirks, or odd formats must be handled in the build layer
- **No "fixing" tokens by rewriting JSON**

---

## 3. Technology Choices (Locked for MVP)

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v18+ | Runtime |
| npm | - | Package management |
| Style Dictionary | v5+ | Token transformation |
| @tokens-studio/sd-transforms | Latest | Tokens Studio compatibility |
| JSON | - | Token input format |
| CSS Variables | - | Output format |

**No additional frameworks or tooling unless explicitly approved.**

---

## 4. Token Export Strategy

### 4.1 Export Format

- **DTCG-style JSON is the canonical input format**
- `$value` / `$type` fields are expected
- Build layer adapts to DTCG quirks instead of rejecting them
- DTCG is kept to preserve industry alignment and future extensibility

### 4.2 File Organization

- **Tokens are foldered, not a single giant JSON**
- One conceptual set per file (core, semantic, modes, brand, etc.)
- The build layer may merge internally, but source stays split
- This improves debuggability and allows selective inclusion/exclusion

---

## 5. Units & Value Contracts

### 5.1 Unit Rules (Design vs Output)

| Token Type | Authoring (Design) | Output (CSS) |
|------------|-------------------|--------------|
| Opacity | 0–100 (e.g. 56) | 0–1 (0.56) |
| Spacing | px or rem | px or rem |
| Border Radius | px or rem | px or rem |
| Border Width | px | px |
| Font Size | px or rem | rem preferred |
| Font Weight | number (400) | number |
| Line Height | number (1.25) | unitless |
| Z-Index | number | number |

**Important: Authoring convenience ≠ runtime correctness. Normalization happens in the build layer.**

### 5.2 Opacity Normalization (Explicit Policy)

**Authoring Contract:**
Opacity tokens may be authored or exported as:
- `"56px"`
- `"56"`
- `56`

**Consumption Contract:**
The build layer must:
- Detect opacity tokens by path or name
- Strip units if present
- Convert 0–100 → 0–1
- Output unitless decimals
- Warn (but not fail) if values fall outside [0,1]

**Source tokens are never edited.**

### 5.3 Font Weight Normalization (Explicit Policy)

**Authoring Contract:**
Font weight tokens may be exported from Tokens Studio as strings:
```json
{
  "$type": "fontWeight",
  "$value": "600"
}
```

This is acceptable and expected. Designers do not convert or reformat font weight values.

**Consumption Contract:**
The build layer must:
- Detect font weight tokens by path or name (e.g., `.fontWeight.`)
- Convert string numeric values to numbers:
  - `"400"` → `400`
  - `"600"` → `600`
- Ensure output is unitless and numeric
- Warn (but do not fail) if the value is not a valid numeric font weight

**Output Contract:**
Font weight values are emitted as numbers (no quotes, no units):
```css
--nexus-font-weight-semibold: 600;
```

**Rationale:** Font weight is a semantic numeric value. String-to-number normalization is an industry-standard responsibility of the consumption layer and must not be handled manually by designers.

---

## 6. Project Phases (State Tracking)

**The project must always be in exactly one phase.**

### Phase 1 — Ingestion
- Tokens load successfully into the build system
- No output required yet

### Phase 2 — Normalization
- Token quirks handled (opacity, units, references)
- Unresolvable tokens are excluded, not "fixed"

### Phase 3 — Selection / Scoping
- One brand or mode built at a time
- No collisions during build

### Phase 4 — Output
- `tokens.css` generated successfully
- Naming matches expectations (e.g., `--nexus-color-neutral-100`)

### Phase 5 — Consumption
- UI or demo consumes generated tokens
- Semantic tokens preferred

**AI agents must explicitly state the current phase before making changes.**

---

## 7. Current Restart Scope (MVP)

### ✅ Included
- Single brand or token set
- Core + semantic tokens
- CSS variable output
- Opacity normalization
- Font weight normalization

### 🔄 Explicitly Deferred
- Full typography token composition
- Multi-brand merging
- Component-level tokens
- Platform-specific outputs (iOS, Android, etc.)

**Deferred ≠ ignored. Deferred means not blocking output.**

---

## 8. Execution Discipline for AI Agents

### ✅ Mandatory Behavior

AI agents must:
1. Identify current phase
2. State last completed step
3. Propose one next step
4. Execute only that step
5. Stop and wait for confirmation

### ❌ Forbidden Behavior

AI agents must NOT:
- Refactor source tokens
- Reformat unrelated files
- Introduce abstractions "for later"
- Solve multiple phases at once
- Rewrite configs wholesale

**Small, reviewable changes only.**

---

## 9. Acceptance Criteria (Definition of Success)

The MVP is successful when:

1. ✅ A designer can replace token JSON files
2. ✅ Running the build produces `tokens.css`
3. ✅ Opacity variables are correct (0–1)
4. ✅ Font weight variables are numeric
5. ✅ No source tokens were edited
6. ✅ The pipeline is understandable by inspection

---

## 10. Instructions for GitHub Copilot / AI Agents

### Before Making Changes:
1. Read this document in full
2. State the current phase
3. Confirm constraints

### When Blocked:
1. Report the issue
2. Explain why it blocks output
3. Propose isolation or exclusion, not refactor

### When Unsure:
1. Choose the simplest reversible option
2. Prefer documentation over code changes

---

## 11. Final Authority

If there is a conflict between:
- Tool defaults
- AI suggestions
- Convenience refactors
- This document

**This document wins.**

---

## Integration with Other Context Files

This constraints document should be read **first** before consulting:
- `PROJECT_OVERVIEW.md` - High-level goals and phases
- `ARCHITECTURE.md` - System design
- `IMPLEMENTATION_PLAN.md` - Detailed roadmap
- `TOKEN_ANALYSIS.md` - Source token structure
- `DECISIONS.md` - Technical decisions

When there is a conflict between this document and other context files, **this document takes precedence.**
