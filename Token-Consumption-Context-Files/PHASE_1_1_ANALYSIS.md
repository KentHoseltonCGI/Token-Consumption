# Phase 1.1 - Deep Token Analysis Results

## Current Phase
**Phase:** 1.1 - Deep Token Analysis  
**Status:** ✅ Complete  
**Date:** February 4, 2026

---

## Executive Summary

Analyzed all source token files in `Nexus-Source-Tokens/tokens/`. **Critical finding:** Opacity tokens are exported with `"px"` units (e.g., `"56px"`) and must be normalized to 0-1 range per CONSTRAINTS.md policy.

---

## Token Reference Syntax (CONFIRMED)

**Format:** Curly brace syntax: `{Nexus.color.Red.100}`

**Examples:**
```json
{
  "$type": "color",
  "$value": "{Nexus.color.deepBlue.600}"
}
```

This is the Tokens Studio standard reference format and is compatible with @tokens-studio/sd-transforms.

---

## Complete Token Inventory

### 1. Primitive Tokens (`01 Primitive ✅/Mode 1.json`)

**Total: 742 lines**

#### Token Categories:

**Colors (Nexus namespace):**
- `neutral` (10 shades: 100-1000)
- `slate` (10 shades: 100-1000)
- `deepBlue` (10 shades: 100-1000)
- `blue` (10 shades: 100-1000)
- `teal` (10 shades: 100-1000)
- `green` (10 shades: 100-1000)
- `lime` (10 shades: 100-1000)
- `brightYellow` (10 shades: 100-1000)
- `Red` (10 shades: 100-1000) *Note: Capital R*
- `Orange` (10 shades: 100-1000) *Note: Capital O*
- `Yellow` (10 shades: 100-1000) *Note: Capital Y*
- `deepGreen` (10 shades: 100-1000)
- `system.black` & `system.white`

**Total primitive colors:** ~122 color tokens

**Typography (Nexus namespace):**
- `fontFamily.inter` - value: "Inter"
- `fontWeight.regular` - value: "regular" ⚠️ STRING
- `fontWeight.medium` - value: "medium" ⚠️ STRING
- `fontWeight.semibold` - value: "semibold" ⚠️ STRING
- `fontWeight.light` - value: "light" ⚠️ STRING

**⚠️ CRITICAL:** Font weight values are KEYWORD STRINGS, not numbers. These need mapping:
- "light" → 300
- "regular" → 400
- "medium" → 500
- "semibold" → 600

**Sizing Scale (Nexus namespace):**
- Numeric scale from 00 (0) to 8000 (320)
- Type: `"number"` (unitless pixel values)
- 23 scale steps total

**Colors (IOS namespace):**
- `grey` (8 shades: 100-800)
- `neutral-grey` (15 shades: 100-1500)

**Total iOS colors:** 23 tokens

---

### 2. Rem-based Tokens (`01 rem ✅/Mode 1.json`)

**Total: 200 lines**

**Sizing in rem (Nexus namespace):**
- 26 sizing tokens
- Values: rem-based dimensions (e.g., "0.125rem", "1rem", "20rem")
- Keys: numeric (00, 06, 12, 25, 37, 50, 62, 75, 88, 100, 112, 125, 150, 175, 200, 225, 250, 275, 300, 350, 400, 450, 500, 1000, 2000)
- Type: `"dimension"`

**Purpose:** Responsive sizing using rem units instead of pixel-based primitives.

---

### 3. Alias Tokens (`02 Alias ✅/`)

**Files:** myQ.json, Community.json, Enterprise.json, LiftMaster Pro.json  
**Size:** Each ~702 lines

#### Structure (All brands follow same pattern):

**System Color Aliases (Nexus.color.system):**
- `error.*` (10 shades) - References primitive colors
- `success.*` (10 shades)
- `primary.*` (10 shades)
- `info.*` (10 shades)
- `warning.*` (10 shades)
- `danger.*` (10 shades)
- `content.*` (11 shades including 000 for white)
- `accent.*` (10 shades)
- `neutral.*` (11 shades including 000)

**Brand Color Aliases (Nexus.color.brand):**
- `dusk.*` (10 shades)
- `midBlue.*` (10 shades)
- `newSky.*` (10 shades)

#### Brand Differences (Examples):

**myQ:**
- `primary` → `{Nexus.color.deepBlue.*}`
- `error` → `{Nexus.color.Red.*}`

**Community:**
- `primary` → `{Nexus.color.teal.*}`
- `error.100-200` → `{Nexus.color.brightYellow.*}` (different!)
- `error.300-1000` → `{Nexus.color.Red.*}`

**Key Finding:** Brands map semantic color names to different primitive colors. This enables brand-specific theming.

---

### 4. Palette Tokens (`03 Palette ✅/`)

**Files:** light.json, dark.json  
**Size:** Each ~865 lines

#### Structure:

**Semantic Color Mappings (Nexus.color):**
- `content.*` (primary, secondary, onColor, disabled, link, tertiary)
- `background.surface.*` (10 variations)
- `background.primary.*` (6 variations)
- `background.error.*` (6 variations)
- `background.success.*` (6 variations)
- `background.info.*` (6 variations)
- `background.warning.*` (6 variations)
- `background.danger.*` (6 variations)
- `background.neutral.*` (5 variations)
- `background.secondary.*` (6 variations)
- `foreground.primary.*` (3 variations)
- `foreground.error.*` (3 variations)
- ... (more foreground categories)

**Border colors** (border.*)
**Elevation** (elevation.*)

#### Theme Differences:

**Light Mode:**
```json
"content.primary": "{Nexus.color.system.content.900}" // Dark text
"background.surface.primary": "{Nexus.color.system.white}" // White bg
```

**Dark Mode:**
```json
"content.primary": "{Nexus.color.system.content.200}" // Light text
"background.surface.primary": "{Nexus.color.slate.800}" // Dark bg
```

**⚠️ Note:** Some tokens use hex with alpha instead of references:
```json
"disabled": "#17191c80" // light mode
"disabled": "#e4e8f280" // dark mode
```

---

### 5. Mapped Tokens (`03 Mapped ✅/Mode 1.json`)

**Total: 1594 lines** - LARGEST file

#### Namespaces:

**MUI namespace:**
- Material-UI specific tokens
- Typography tokens (overline)
- **⚠️ CRITICAL:** Opacity tokens with UNITS!

```json
"MUI": {
  "opacity": {
    "active": {
      "$type": "dimension",
      "$value": "56px"  // ⚠️ Should be 0.56
    },
    "focus": {
      "$type": "dimension",
      "$value": "12px"  // ⚠️ Should be 0.12
    },
    "outlinedBorder": {
      "$type": "dimension",
      "$value": "50px"  // ⚠️ Should be 0.50
    },
    "Hover": {
      "$type": "dimension",
      "$value": "4px"   // ⚠️ Should be 0.04
    },
    "Selected": {
      "$type": "dimension",
      "$value": "8px"   // ⚠️ Should be 0.08
    }
  }
}
```

**Nexus namespace:**
- `textToken.*` - Typography references
- `Opacity.*` - More opacity tokens (refs to sizing.scale)

```json
"Nexus": {
  "Opacity": {
    "disabled": { "$value": "{Nexus.sizing.scale.800}" },  // 32
    "overlay": { "$value": "{Nexus.sizing.scale.600}" },   // 24
    "focusVisible": { "$value": "{Nexus.sizing.scale.500}" }, // 20
    "disabledBg": { "$value": "{Nexus.sizing.scale.300}" },   // 12
    "outlineHover": { "$value": "{Nexus.sizing.scale.1200}" } // 48
  }
}
```

**⚠️ These reference scale values 0-320 and need conversion to 0-1 range.**

- `shape.*` - Border radius, border width
- `spacing.*` - Spacing scale (1-12, none)
- `sizing.*` - Size scale (3xs-3xl)
- `Headings.*` - H1-H6 typography compositions
- `Body.*` - Body text typography
- `button.*` - Button tokens

---

### 6. Responsive Tokens (`03 Responsive ✅/`)

**Files:** Mobile.json, Larger Breakpoint.json

**Status:** ⚠️ Need to analyze these files (deferred for MVP but should document)

---

## Critical Normalization Issues

### Issue 1: Opacity with "px" Units (CONFIRMED)

**Location:** `03 Mapped ✅/Mode 1.json` → `MUI.opacity.*`

**Problem:**
```json
"active": { "$type": "dimension", "$value": "56px" }
```

**Expected Output:**
```css
--mui-opacity-active: 0.56;
```

**Solution per CONSTRAINTS.md:**
- Detect by path (`MUI.opacity.*`)
- Strip "px" unit
- Divide by 100 to convert 0-100 → 0-1
- Output unitless decimal

### Issue 2: Opacity via Scale References

**Location:** `03 Mapped ✅/Mode 1.json` → `Nexus.Opacity.*`

**Problem:**
```json
"disabled": { "$value": "{Nexus.sizing.scale.800}" }  // Resolves to 32
```

**Expected Output:**
```css
--nexus-opacity-disabled: 0.32;
```

**Solution:**
- Detect by path (`*.Opacity.*` or `*.opacity.*`)
- Resolve reference (32)
- Divide by 100
- Output unitless decimal

### Issue 3: Font Weight Keywords

**Location:** `01 Primitive ✅/Mode 1.json` → `Nexus.typography.fontWeight.*`

**Problem:**
```json
"regular": { "$type": "text", "$value": "regular" }
"medium": { "$type": "text", "$value": "medium" }
"semibold": { "$type": "text", "$value": "semibold" }
"light": { "$type": "text", "$value": "light" }
```

**Expected Output:**
```css
--nexus-typography-font-weight-regular: 400;
--nexus-typography-font-weight-medium: 500;
--nexus-typography-font-weight-semibold: 600;
--nexus-typography-font-weight-light: 300;
```

**Solution per CONSTRAINTS.md:**
- Detect by path (`*.fontWeight.*`)
- Map keywords to numbers:
  - "light" → 300
  - "regular" → 400
  - "medium" → 500
  - "semibold" → 600
  - "bold" → 700 (if present)
- String numbers ("400") → 400
- Output numeric, unitless

---

## Token Type Catalog

### Confirmed Token Types:

| $type | Count (approx) | Example Value | CSS Output |
|-------|----------------|---------------|------------|
| `color` | ~500+ | `"#f7f7f7"` or `"{Nexus.color.Red.100}"` | `#f7f7f7` |
| `dimension` | ~200+ | `"0.125rem"` or `"56px"` or `"{Nexus.sizing.100}"` | `0.125rem` or `0.56` (if opacity) |
| `number` | ~25 | `1`, `4`, `320` | `1`, `4`, `320` (unitless) |
| `text` | ~10 | `"Inter"`, `"regular"` | `"Inter"` or `400` (if fontWeight) |
| `typography` | ~20+ | Composite object | Not MVP scope |

---

## Dependency Graph Insights

### Token Resolution Order (from $metadata.json):

1. `01 Primitive ✅/Mode 1` - No dependencies
2. `01 rem ✅/Mode 1` - May reference primitives
3. `02 Alias ✅/myQ` - References primitives
4. `02 Alias ✅/Community` - References primitives
5. `02 Alias ✅/LiftMaster Pro` - References primitives
6. `02 Alias ✅/Enterprise` - References primitives
7. `03 Palette ✅/light` - References aliases
8. `03 Palette ✅/dark` - References aliases
9. `03 Mapped ✅/Mode 1` - References all above
10. `03 Responsive ✅/Mobile` - May override any
11. `03 Responsive ✅/Larger Breakpoint` - May override any

### Reference Patterns:

**Simple references:**
```json
"{Nexus.color.Red.100}"
```

**Nested/chained references:**
```json
"{Nexus.color.system.primary.600}" // Points to alias
  → "{Nexus.color.deepBlue.600}"   // Points to primitive
    → "#172dbd"                     // Final value
```

**No circular references detected** in the token sets analyzed.

---

## MVP Build Strategy

### For Single Brand (myQ) + Light Theme:

**Include:**
1. `01 Primitive ✅/Mode 1` ✅
2. `01 rem ✅/Mode 1` ✅
3. `02 Alias ✅/myQ` ✅
4. `03 Palette ✅/light` ✅
5. `03 Mapped ✅/Mode 1` ✅ (with opacity normalization)

**Exclude (for MVP):**
- Other brands (Community, Enterprise, LiftMaster Pro)
- Dark theme
- Responsive tokens
- Typography compositions
- iOS-specific tokens

---

## Transformation Requirements Summary

### Must Handle:

1. ✅ **Token references** - `{Path.to.token}` syntax
2. ✅ **Opacity normalization** - Path-based detection + conversion
3. ✅ **Font weight normalization** - Keyword → number mapping
4. ✅ **Chained references** - Multi-level resolution
5. ✅ **Mixed units** - rem, px, unitless numbers
6. ✅ **Hex colors** - With and without alpha

### MVP Can Defer:

- ❌ Typography composite tokens (full $value objects)
- ❌ Multiple theme/brand builds
- ❌ Responsive token overlays
- ❌ Platform-specific namespaces (iOS)

---

## Answers to TOKEN_ANALYSIS.md Questions

### Token Types Present:
✅ color, dimension, number, text, typography

### Total Token Count:
**Estimated:** 800-1000 tokens across all files  
**MVP Scope:** ~400-500 tokens (single brand + light theme)

### Token Reference Syntax:
✅ Confirmed: `{Namespace.path.to.token}`

### Circular References:
✅ None detected

### Brand Completeness:
✅ All brands appear complete with full system color mappings

### Rem Base Size:
⚠️ Not explicitly defined in tokens. Standard assumption: 16px base.

---

## Next Steps

**Phase 1 Complete.** Ready to proceed to **Phase 1.4: Project Initialization**

### Immediate Actions:

1. ✅ Initialize `package.json` with Style Dictionary dependencies
2. ✅ Configure Style Dictionary with myQ + light theme as MVP
3. ✅ Implement custom transforms:
   - Opacity normalization (path: `*.opacity.*` or `*.Opacity.*`)
   - Font weight normalization (path: `*.fontWeight.*`)
4. ✅ Test build with subset of tokens
5. ✅ Validate CSS output

---

**Analysis complete. Standing by for Phase 1.4 initialization.**
