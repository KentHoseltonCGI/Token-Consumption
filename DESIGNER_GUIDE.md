# Designer Guide: Token Source Files

Replace the `tokens` folder with your exported token files. The build reads from `Nexus-Source-Tokens/tokens/`.

---

## Workflow

1. Export your tokens from Tokens Studio (or your design tool) as JSON.
2. Replace the contents of `Nexus-Source-Tokens/tokens/` with your token files.
3. Run `npm run build`.
4. Tokens appear in `dist/css/tokens.css` and the Token Viewer.

**Expected structure:** The build expects specific file paths (see `build.js`). Keep the same folder and file names, or update `build.js` to match your structure.

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
