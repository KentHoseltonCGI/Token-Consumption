# Designer Guide: Adding Token Source Files

Drop token JSON files into the Designer Imports folder — no config or build code changes needed.

---

## Steps

1. Export your tokens from Tokens Studio (or your design tool) as JSON.
2. Copy the file into:

   ```
   Nexus-Source-Tokens/tokens/04 Designer Imports/
   ```

3. Run `npm run build`.
4. Your tokens will appear in `dist/css/tokens.css` and in the Token Viewer.

**All `.json` files in this folder are automatically included** in both light and dark theme builds.

---

## Token format

Files should follow the [DTCG token format](https://design-tokens.github.io/community-group/format/). Tokens Studio exports are compatible.

---

## Build output

```bash
npm run build
```

- `dist/css/tokens.css` — CSS variables (light + dark)
- `dist/json/tokens-preserved-light.json` — Token viewer (light)
- `dist/json/tokens-preserved-dark.json` — Token viewer (dark)

---

## Tips

- **References**: Use `{Nexus.color.blue.500}` syntax to reference other tokens.
- **Naming**: Token names become CSS variables like `--nexus-color-blue-500`.
- **Validation**: Run `npm run validate` to check token structure.
