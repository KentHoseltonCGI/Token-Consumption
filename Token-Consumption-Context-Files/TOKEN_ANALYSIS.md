# Token Analysis - Source Structure

## Overview

This document provides a detailed analysis of the source token files in `Nexus-Source-Tokens/tokens/`. Understanding this structure is critical for building the transformation pipeline.

## File Inventory

### Configuration Files

#### `$metadata.json`
Defines the order in which token sets should be processed and applied:
```json
{
  "tokenSetOrder": [
    "01 Primitive ✅/Mode 1",
    "01 rem ✅/Mode 1",
    "02 Alias ✅/myQ",
    "02 Alias ✅/Community",
    "02 Alias ✅/LiftMaster Pro",
    "02 Alias ✅/Enterprise",
    "03 Palette ✅/light",
    "03 Palette ✅/dark",
    "03 Mapped ✅/Mode 1",
    "03 Responsive ✅/Mobile",
    "03 Responsive ✅/Larger Breakpoint"
  ]
}
```

**Purpose:** This order is crucial for token resolution since later sets can reference tokens from earlier sets.

#### `$themes.json`
Currently empty array `[]`. May be used for theme configuration in the future.

## Token Set Categories

### 1. Primitive Tokens (`01 Primitive ✅/Mode 1.json`)

**Purpose:** Foundation tokens with absolute values, no references to other tokens.

**Token Types:**
- Colors (hex values)
- Spacing values
- Border radius
- Font sizes
- Line heights
- Font weights
- Font families
- Other base design decisions

**Example Structure (from observation):**
```json
{
  "Nexus": {
    "color": {
      "neutral": {
        "100": { "$type": "color", "$value": "#f7f7f7" },
        "200": { "$type": "color", "$value": "#ececec" },
        ...
      },
      "slate": {
        "100": { "$type": "color", "$value": "#f2f5fa" },
        ...
      }
    }
  }
}
```

**Characteristics:**
- All values are absolute (hex colors, pixel values)
- No token references
- Forms the foundation for all other tokens
- Typically the largest token set

**Questions to Answer:**
- [ ] What are all token types present?
- [ ] What is the complete token namespace structure?
- [ ] Are there any nested levels beyond what we've seen?
- [ ] What is the total token count?

### 2. Rem-based Tokens (`01 rem ✅/Mode 1.json`)

**Purpose:** Responsive sizing tokens using rem units instead of pixels.

**Characteristics:**
- May reference primitive tokens
- Uses rem units for responsive design
- Typically includes spacing, font sizes, and sizing scales

**Questions to Answer:**
- [ ] How many tokens are in this set?
- [ ] Do tokens reference primitives or have absolute rem values?
- [ ] What is the rem base size assumption?

### 3. Alias Tokens (`02 Alias ✅/`)

**Purpose:** Brand-specific token aliases that reference primitive tokens.

**Files:**
- `Community.json` - Community brand tokens
- `Enterprise.json` - Enterprise brand tokens  
- `LiftMaster Pro.json` - LiftMaster Pro brand tokens
- `myQ.json` - myQ brand tokens

**Characteristics:**
- Reference primitive and rem tokens
- Create brand-specific naming
- Allow different brands to share infrastructure with custom values
- Enable multi-brand support from single token source

**Questions to Answer:**
- [ ] What tokens differ between brands?
- [ ] What is the reference syntax used?
- [ ] How extensive are the brand variations?
- [ ] Are all brands complete or do some inherit defaults?

### 4. Palette Tokens (`03 Palette ✅/`)

**Purpose:** Theme-specific color assignments for light and dark modes.

**Files:**
- `light.json` - Light theme color mappings
- `dark.json` - Dark theme color mappings

**Characteristics:**
- Reference primitive color tokens
- Assign semantic meaning to colors
- Enable theme switching
- Map concepts like "background", "text", "border" to actual colors

**Questions to Answer:**
- [ ] What semantic color names are defined?
- [ ] How do light and dark palettes differ?
- [ ] Do palettes reference brand alias tokens or primitives?
- [ ] Are there partial palettes or complete definitions?

### 5. Mapped Tokens (`03 Mapped ✅/Mode 1.json`)

**Purpose:** Semantic tokens that map abstract UI concepts to concrete values.

**Characteristics:**
- Reference alias, palette, and primitive tokens
- Provide component-level token names
- Map UI patterns to token values
- Examples: "button.background", "input.border", "card.shadow"

**Questions to Answer:**
- [ ] What components are covered?
- [ ] What is the mapping structure?
- [ ] How deep is the nesting?
- [ ] What token types are mapped (colors, spacing, typography)?

### 6. Responsive Tokens (`03 Responsive ✅/`)

**Purpose:** Breakpoint-specific token overrides.

**Files:**
- `Mobile.json` - Mobile breakpoint tokens
- `Larger Breakpoint.json` - Desktop/tablet tokens

**Characteristics:**
- Override base tokens at specific breakpoints
- Typically affect spacing, typography, layout
- May reference any previous token type

**Questions to Answer:**
- [ ] What breakpoint values trigger these tokens?
- [ ] What tokens are responsive?
- [ ] How do these override base tokens?

## Token Reference Patterns

### Possible Reference Formats

Design tokens may use various reference syntaxes:

1. **Curly brace syntax:** `{color.primary.500}`
2. **Dollar syntax:** `$color.primary.500`
3. **Object reference:** `{ "value": "{color.primary.500}" }`
4. **Path array:** `["color", "primary", "500"]`

**Action Required:** Analyze actual token files to determine the reference format used.

## Token Properties

### Standard Properties (W3C Design Tokens Spec)
- `$type` - Token type (color, dimension, fontFamily, etc.)
- `$value` - Token value (may be absolute or reference)
- `$description` - Token description (optional)

### Possible Extended Properties
- `$extensions` - Vendor-specific extensions
- Tokens Studio specific metadata
- Platform hints or overrides

**Action Required:** Catalog all properties used in the token files.

## Token Types

### Expected Token Types
Based on the primitives observed, we expect:

- **color** - Hex color values
- **dimension** - Size values (px, rem, em)
- **fontFamily** - Font stack definitions
- **fontWeight** - Numeric or keyword weights
- **fontSize** - Text size values
- **lineHeight** - Line height values
- **spacing** - Margin, padding values
- **borderRadius** - Corner radius values
- **borderWidth** - Border thickness
- **opacity** - Transparency values
- **shadow** - Box shadow definitions
- **duration** - Animation timing
- **cubicBezier** - Easing functions

**Action Required:** Confirm all token types present in the source files.

## Transformation Requirements

### What We Need to Extract

1. **Token Inventory**
   - Complete list of all tokens across all sets
   - Token types and values
   - Reference relationships

2. **Dependency Graph**
   - Which tokens reference which others
   - Circular reference detection
   - Resolution order

3. **Brand Matrix**
   - What tokens differ per brand
   - Default values vs brand-specific

4. **Theme Matrix**  
   - Light vs dark differences
   - Theme-neutral tokens

5. **Responsive Matrix**
   - Base values vs responsive overrides
   - Breakpoint definitions

## Next Steps

1. **Deep Analysis Task:** Read and analyze each token file completely
2. **Document Token Patterns:** Create comprehensive token catalog
3. **Map References:** Build dependency graph
4. **Identify Gaps:** Find missing or incomplete definitions
5. **Define Validation Rules:** What makes a token set valid?

## Notes for AI Agents

When analyzing these tokens:
- Read complete files, not just samples
- Track token paths and structures
- Note any unusual patterns or edge cases
- Identify potential transformation challenges
- Consider platform-specific requirements
