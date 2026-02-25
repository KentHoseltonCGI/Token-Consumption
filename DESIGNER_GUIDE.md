# Designer Guide: Token Source Files

Replace the `tokens` folder with your exported token files. The build **auto-discovers** all JSON files in `Nexus-Source-Tokens/tokens/` — no need to edit `build.js` when adding new files.

---

## Workflow

1. Export your tokens from Tokens Studio (or your design tool) as JSON.
2. Replace the contents of `Nexus-Source-Tokens/tokens/` with your token files.
3. Run `npm run build`.
4. Tokens appear in `dist/css/tokens.css` and the Token Viewer.

**New files are auto-included:** Add any `.json` file to the tokens folder and it will be picked up by the next build.

---

## Merge order

- **With `$metadata.json`:** Tokens Studio exports include this file with a `tokenSetOrder` array. The build uses this order to merge token files (later files override earlier ones).
- **Without metadata:** Files are included in path-sorted order. Add `$metadata.json` with `tokenSetOrder` if you need to control merge order.

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
