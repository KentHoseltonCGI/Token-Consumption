# Typography Token Preservation: Problem & Solution

## Problem Statement

### The Issue
When importing typography tokens from source files (`03 Mapped ✅/Mode 1.json`), the build process was breaking apart composite typography tokens into individual CSS properties, losing their semantic grouping and design intent.

**Source Token Structure:**
```json
{
  "Nexus": {
    "Headings": {
      "H1": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{Nexus.Base.Sans.fontFamily}",
          "fontWeight": "{Nexus.Base.Bold.fontWeight}",
          "fontSize": "{Nexus.Headings.H1.fontSize}",
          "lineHeight": "{Nexus.Headings.H1.lineHeight}",
          "letterSpacing": "{Nexus.Headings.H1.letterSpacing}"
        }
      }
    }
  }
}
```

**Problematic Build Output:**
```css
--nexus-headings-h1-font-family: Inter;
--nexus-headings-h1-font-weight: 700;
--nexus-headings-h1-font-size: 32px;
--nexus-headings-h1-line-height: 40px;
--nexus-headings-h1-letter-spacing: -0.5px;
```

### Why This Is Wrong

1. **Loss of Semantic Grouping**: The typography token `Nexus.Headings.H1` represents a complete, cohesive text style. Breaking it into separate properties loses this semantic meaning.

2. **Defeats Design-Dev Pipeline**: Design tokens exist to bridge design and development by preserving design decisions as structured data. Decomposing composite tokens and then attempting to rebuild them defeats this purpose.

3. **Viewer Cannot Display Design Intent**: The token viewer should show typography tokens as unified styles (like designers see in Figma), not as scattered individual properties.

4. **Violates DTCG Standard**: The Design Tokens Community Group (DTCG) specification includes composite token types like `typography` specifically to preserve groupings that have semantic meaning.

### Root Cause

The `@tokens-studio/sd-transforms` preprocessor automatically expands composite typography tokens into individual properties by default. This is useful for CSS output (browsers need individual properties), but it destroys the composite structure needed for the token viewer.

**Attempted Workarounds (Why They Failed):**
- **JavaScript Reconstruction**: Created logic to group `--nexus-text-token-h1-*` properties back into composite tokens. This works technically but is fundamentally flawed—we shouldn't break tokens only to rebuild them.
- **Preprocessing Configuration**: Attempted to configure the preprocessor to not expand typography tokens, but the API doesn't support granular expansion control.

## Solution: Dual Output Strategy

### Approach
Create **two separate build outputs** with different purposes:

1. **CSS Platform** (for developers): Expanded individual properties
   - Browsers need `font-size`, `font-weight`, etc. as separate CSS custom properties
   - Keep existing CSS output with decomposed properties

2. **JSON Platform** (for token viewer): Preserved composite tokens
   - Custom preprocessor that identifies and preserves `$type: "typography"` tokens
   - Maintains original composite structure from source files
   - Token viewer consumes this to display unified typography styles

### Benefits

✅ **Preserves Design Intent**: Typography tokens remain grouped as designed
✅ **Maintains Pipeline Integrity**: No decompose-rebuild anti-pattern
✅ **Developer-Friendly CSS**: Individual properties still available for browser consumption
✅ **Accurate Token Viewer**: Shows typography styles as cohesive units (h1, h2, body-lg-emphasized, etc.)
✅ **DTCG Compliant**: Respects composite token types

## Implementation Details

### Architecture

```
Source Tokens (03 Mapped ✅/Mode 1.json)
    ↓
    ├─→ CSS Build Path
    │   ├─ tokens-studio preprocessor (expands typography)
    │   ├─ CSS transforms (size/px, color/hexrgba, etc.)
    │   └─→ dist/css/tokens.css (individual properties)
    │
    └─→ JSON Build Path
        ├─ custom preprocessor (preserves typography composites)
        ├─ minimal transforms (name/kebab only)
        └─→ dist/json/tokens-preserved.json (composite tokens)
```

### Custom Preprocessor Logic

The custom preprocessor identifies tokens with `$type: "typography"` and:
1. Preserves their composite structure
2. Resolves internal references (e.g., `{Nexus.Base.Bold.fontWeight}` → `700`)
3. Maintains the grouping in the output JSON

### Token Viewer Integration

The viewer will:
1. Load `tokens-preserved.json` instead of decomposed metadata
2. Identify typography composite tokens by `$type: "typography"`
3. Render them with visual previews showing the complete style
4. Display all properties (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing) as a unified token

## Expected Outcomes

### Token Viewer Display
Users will see typography tokens organized hierarchically:
```
📁 Nexus
  📁 Headings
    🔤 H1 (typography)
       fontFamily: Inter
       fontWeight: 700
       fontSize: 32px
       lineHeight: 40px
       letterSpacing: -0.5px
    🔤 H2 (typography)
    🔤 H3 (typography)
    ...
  📁 Body
    🔤 lg-default (typography)
    🔤 lg-emphasized (typography)
    🔤 lg-subtle (typography)
    ...
```

### CSS Output (Unchanged)
Developers continue to use individual CSS properties:
```css
.heading-1 {
  font-family: var(--nexus-headings-h1-font-family);
  font-weight: var(--nexus-headings-h1-font-weight);
  font-size: var(--nexus-headings-h1-font-size);
  line-height: var(--nexus-headings-h1-line-height);
  letter-spacing: var(--nexus-headings-h1-letter-spacing);
}
```

## Technical Context

### Source Files Structure
- **03 Mapped ✅/Mode 1.json**: Contains ~45 composite typography tokens with `$type: "typography"`
  - Headings: H1-H6
  - Subtitles: Lg, Sm
  - Body: lg/md/sm × default/emphasized/subtle
  - Label, Link, Caption, Button styles

- **03 Responsive ✅/**: Contains decomposed properties (fontSize, fontWeight references)
  - Used for responsive breakpoint variations
  - Not relevant for composite token preservation

### Build Tool Stack
- **Style Dictionary v4.x**: Core token transformation engine
- **@tokens-studio/sd-transforms**: Handles DTCG format, provides token-studio transformGroup
- **Custom Transforms**: 
  - `nexus/opacity/normalize`: Converts opacity values to 0-1 range
  - `nexus/fontWeight/normalize`: Maps font weight keywords to numeric values

### Token Viewer Architecture
- Single-page JavaScript application (index.html)
- Hierarchical tree view with expand/collapse
- Visual preview system for different token types
- Filter chips, search, responsive grid layout
- Currently has typography grouping logic (to be replaced)

## Migration Path

### Phase 1: Dual Output Build ✅
- [x] Create custom preprocessor for typography preservation
- [x] Add new JSON platform with preserved tokens
- [x] Test build generates both CSS and preserved JSON

### Phase 2: Viewer Integration
- [ ] Update viewer to load `tokens-preserved.json`
- [ ] Remove JavaScript grouping logic (no longer needed)
- [ ] Add rendering support for composite typography tokens
- [ ] Test all typography styles display correctly

### Phase 3: Validation
- [ ] Verify all 45+ typography tokens visible
- [ ] Confirm CSS output unchanged (no breaking changes)
- [ ] Test token references resolve correctly
- [ ] Document usage for future contributors

## References

- **DTCG Specification**: [Design Tokens Format Module](https://tr.designtokens.org/format/)
- **Composite Token Types**: Typography, shadow, border, transition
- **Style Dictionary Docs**: [Preprocessors](https://styledictionary.com/reference/hooks/preprocessors/)
- **Previous Attempt**: See git history for JavaScript grouping logic approach (commit: "Group and display composite typography tokens")
