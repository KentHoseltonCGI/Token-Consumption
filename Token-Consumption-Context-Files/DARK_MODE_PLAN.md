# Dark Mode Implementation Plan

## Goal

Implement dark mode for the Token Viewer with two priorities:

1. **Primary:** Switch palette modes (light ↔ dark) in the **preview area** so token color previews render correctly in both themes
2. **Secondary:** Apply dark mode to the **page chrome** (backgrounds, text, borders, etc.) for a cohesive experience

## Current State

### Build
- **SOURCE_FILES** in `build.js` includes `03 Palette ✅/light.json` only
- `dark.json` exists at `Nexus-Source-Tokens/tokens/03 Palette ✅/dark.json` but is not built
- Output: single `dist/css/tokens.css` and `dist/json/tokens-preserved.json` (light palette only)

### Palette Differences (light vs dark)
| Token Path | Light | Dark |
|------------|-------|------|
| content.primary | content.900 | content.200 |
| content.secondary | content.600 | content.500 |
| background.surface.primary | white | slate.800 |
| background.surface.secondary | slate.100 | slate.900 |
| background.surface.tertiary | slate.200 | neutral.1000 |
| content.disabled | #17191c80 | #e4e8f280 |
| ... | ... | ... |

### Token Viewer (index.html)
- Loads `dist/css/tokens.css` (light only)
- Loads `dist/json/tokens-preserved.json` (light only)
- Previews use `token.value` (resolved from light palette)
- Page styles use `var(--nexus-color-*)` (light palette)

## Architecture Options

### Option A: Dual build + runtime switch (recommended)
1. Build two CSS outputs: `tokens-light.css`, `tokens-dark.css`
2. Build two JSON outputs: `tokens-preserved-light.json`, `tokens-preserved-dark.json`
3. Viewer loads both; toggle switches which CSS + JSON to use for previews
4. Page chrome: apply dark theme via `[data-theme="dark"]` with dark palette variables

### Option B: Single CSS with theme selectors
1. Build outputs: `tokens.css` with `:root` (light) and `[data-theme="dark"]` (dark) blocks
2. Viewer loads one CSS; toggle adds/removes `data-theme="dark"` on `<html>`
3. Previews: need to re-resolve token values when theme changes (or use CSS variables in previews)

### Option C: CSS variables in previews
1. Build both palettes into one CSS with `:root` and `[data-theme="dark"]`
2. Previews use `var(--nexus-color-*)` instead of resolved hex values
3. Toggle theme = change root attribute; previews update automatically

**Recommendation:** Option A for preview accuracy (resolved values per theme); Option C for page chrome. Hybrid: build both palettes in one CSS for page, load both JSON for preview value resolution.

## Implementation Plan

### Phase 1: Build layer
1. Add `dark.json` to build config (or create mode-specific build scripts)
2. Output `tokens-light.css` / `tokens-dark.css` OR single `tokens.css` with `:root` + `[data-theme="dark"]`
3. Output `tokens-preserved-light.json` / `tokens-preserved-dark.json` for preview resolution

### Phase 2: Preview palette switch (primary)
1. Load both preserved JSON files (light + dark)
2. Add theme toggle (e.g. sun/moon icon) in filter bar
3. When dark mode: use `tokensDark` / `cssTokensDark` for preview value resolution
4. Re-render or update preview containers when theme changes
5. Ensure preview backgrounds (e.g. opacity checkerboard, swatch containers) use theme-appropriate colors

### Phase 3: Page dark mode (secondary)
1. Build dark palette into CSS under `[data-theme="dark"]` or `html.dark`
2. Add `data-theme` or `.dark` to `<html>` when toggle is on
3. Ensure all page styles use token variables (already done) so they inherit dark values
4. Add any dark-specific overrides if needed

### Phase 4: Persistence
1. Store theme preference in `localStorage`
2. Restore on page load
3. Optional: respect `prefers-color-scheme: dark` as default

## Files to Modify

| File | Changes |
|------|---------|
| `build.js` | Add dark palette build; output light + dark CSS and/or JSON |
| `index.html` | Theme toggle UI; load both token sets; switch preview resolution; apply `data-theme` |
| `Token-Consumption-Context-Files/` | This plan; update PROJECT_OVERVIEW if needed |

## Preview-Specific Considerations

- **Color swatches:** Use resolved value from active theme's token set
- **Opacity preview:** Overlay color + checkerboard background should match theme
- **Typography preview:** Text color should use theme-appropriate content color
- **Spacing/sizing boxes:** Border/background colors from theme
- **Gradient/effect previews:** Resolved from theme's palette

## Testing Checklist

- [ ] Toggle switches between light and dark
- [ ] All color token previews show correct values per theme
- [ ] Opacity preview checkerboard readable in both themes
- [ ] Typography preview text readable in both themes
- [ ] Page background, text, borders switch correctly
- [ ] Filter chips, search, tree remain usable in dark mode
- [ ] Theme persists across page reload
