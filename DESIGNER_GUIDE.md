# Designer Guide: Adding Token Source Files

This guide explains how to add new design token files to the consumption pipeline **without editing build code**. Designers can import token files in two ways.

---

## Option 1: Drop files in Designer Imports (easiest)

Place any token JSON file in:

```
Nexus-Source-Tokens/tokens/04 Designer Imports/
```

**All `.json` files in this folder are automatically included** in both light and dark theme builds. No config changes needed.

### Steps

1. Export your tokens from Tokens Studio (or your design tool) as JSON.
2. Copy the file into `Nexus-Source-Tokens/tokens/04 Designer Imports/`.
3. Run `npm run build`.
4. Your tokens will appear in `dist/css/tokens.css` and in the Token Viewer.

### Token format

Files should follow the [DTCG token format](https://design-tokens.github.io/community-group/format/). Tokens Studio exports are compatible.

---

## Option 2: Add paths to source-config.json

For more control (e.g. different files for light vs dark, or files in other folders), edit `source-config.json`:

```json
{
  "basePath": "Nexus-Source-Tokens/tokens",
  "light": [
    "01 Primitive ✅/Mode 1.json",
    "01 rem ✅/Mode 1.json",
    "02 Alias ✅/myQ.json",
    "03 Palette ✅/light.json",
    "03 Responsive ✅/Larger Breakpoint.json",
    "03 Mapped ✅/Mode 1.json",
    "04 Designer Imports/MyCustomTokens.json"
  ],
  "dark": [
    "01 Primitive ✅/Mode 1.json",
    "01 rem ✅/Mode 1.json",
    "02 Alias ✅/myQ.json",
    "03 Palette ✅/dark.json",
    "03 Responsive ✅/Larger Breakpoint.json",
    "03 Mapped ✅/Mode 1.json",
    "04 Designer Imports/MyCustomTokens.json"
  ],
  "designerImportsFolder": "04 Designer Imports"
}
```

- **Paths are relative to `basePath`** (e.g. `"04 Designer Imports/MyFile.json"`).
- **Order matters** — later files override earlier ones for the same token.
- Add new paths to both `light` and `dark` unless a file is theme-specific.

---

## Build

After adding files:

```bash
npm run build
```

Outputs:

- `dist/css/tokens.css` — CSS variables (light + dark)
- `dist/json/tokens-preserved-light.json` — Token viewer (light)
- `dist/json/tokens-preserved-dark.json` — Token viewer (dark)

---

## Tips

- **References**: Use `{Nexus.color.blue.500}` syntax to reference other tokens.
- **Naming**: Token names become CSS variables like `--nexus-color-blue-500`.
- **Validation**: Run `npm run validate` to check token structure.
