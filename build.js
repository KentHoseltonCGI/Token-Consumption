import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';
import fs from 'fs';
import path from 'path';

// Register Tokens Studio transforms
// This adds support for DTCG format and token references
register(StyleDictionary);

// Custom preprocessor to preserve composite typography tokens
// This prevents decomposition of tokens with $type: "typography"
StyleDictionary.registerPreprocessor({
  name: 'preserve-typography-composites',
  preprocessor: (dictionary) => {
    // This preprocessor identifies and marks typography composite tokens
    // so they remain grouped in the JSON output for the token viewer
    
    function processTokens(obj, path = []) {
      if (!obj || typeof obj !== 'object') return;
      
      // Check if this is a typography composite token
      if (obj.$type === 'typography' && obj.$value && typeof obj.$value === 'object') {
        // Mark it as a preserved composite for later identification
        obj._isComposite = true;
        obj._compositeType = 'typography';
      }
      // Check if this is a surface composite token (fill + overlay + effect)
      if (obj.$type === 'surface' && obj.$value && typeof obj.$value === 'object' && ('fill' in obj.$value || 'overlay' in obj.$value || 'effect' in obj.$value)) {
        obj._isComposite = true;
        obj._compositeType = 'surface';
      }
      
      // Recurse through the token tree
      for (const key in obj) {
        if (key.startsWith('$') || key.startsWith('_')) continue; // Skip metadata
        if (typeof obj[key] === 'object') {
          processTokens(obj[key], [...path, key]);
        }
      }
    }
    
    processTokens(dictionary);
    return dictionary;
  }
});

// Custom transform for opacity normalization
// Handles both "56px" → 0.56 and scale references like 32 → 0.32
StyleDictionary.registerTransform({
  name: 'nexus/opacity/normalize',
  type: 'value',
  transitive: true,
  filter: (token) => {
    // Match any token with "opacity" or "Opacity" in the path
    const path = token.path.join('.');
    return path.toLowerCase().includes('opacity');
  },
  transform: (token) => {
    let value = token.$value || token.value;
    
    // Handle string values with units like "56px"
    if (typeof value === 'string') {
      // Remove "px" or any other units
      value = value.replace(/px|rem|em|%/gi, '').trim();
      value = parseFloat(value);
    }
    
    // Convert numbers from 0-100 range to 0-1
    if (typeof value === 'number') {
      // If value is > 1, assume it's in 0-100 range
      if (value > 1) {
        return (value / 100).toFixed(2);
      }
      // If value is 0-1, keep as is
      return value.toFixed(2);
    }
    
    // Fallback to original value if we can't parse
    console.warn(`[nexus/opacity/normalize] Could not normalize opacity for ${token.path.join('.')}: ${token.$value || token.value}`);
    return value;
  }
});

// Source files — auto-discover from tokens folder; use $metadata.json tokenSetOrder when present
const TOKENS_BASE = path.join(process.cwd(), 'Nexus-Source-Tokens/tokens');
const TOKEN_SOURCES_DIR = path.join(process.cwd(), 'dist', '.token-sources');

const PALETTE_LIGHT = '03 Palette ✅/light';
const PALETTE_DARK = '03 Palette ✅/dark';
const ALIAS_PREFIX = '02 Alias ✅/';

/** Ensure dist/.token-sources exists for build-time temp files */
function ensureTokenSourcesDir() {
  if (!fs.existsSync(TOKEN_SOURCES_DIR)) {
    fs.mkdirSync(TOKEN_SOURCES_DIR, { recursive: true });
  }
}

/** Expand tokens.json into separate files per set; return paths for light or dark (excludes opposite palette) */
function getSourceFilesFromTokensJson() {
  const tokensPath = path.join(TOKENS_BASE, 'tokens.json');
  if (!fs.existsSync(tokensPath)) return null;

  const raw = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const tokenSetOrder = raw.$metadata?.tokenSetOrder || [];
  ensureTokenSourcesDir();

  const lightSets = tokenSetOrder.filter((k) => k !== PALETTE_DARK);
  const darkSets = tokenSetOrder.filter((k) => k !== PALETTE_LIGHT);

  const lightPaths = [];
  const darkPaths = [];

  for (const setKey of tokenSetOrder) {
    if (setKey.startsWith('$')) continue;
    const tokenSet = raw[setKey];
    if (!tokenSet) continue;

    const filePath = path.join(TOKEN_SOURCES_DIR, `${setKey}.json`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(tokenSet, null, 2));

    if (lightSets.includes(setKey)) lightPaths.push(filePath);
    if (darkSets.includes(setKey)) darkPaths.push(filePath);
  }

  return { light: lightPaths, dark: darkPaths };
}

/** Expand tokens.json into separate files for a specific alias; return path list for light or dark.
 *  IMPORTANT: 02 Alias ✅/Mode must come BEFORE the selected brand alias so the brand's
 *  system.primary (e.g. deepBlue for myQ) overrides Mode's default (teal). */
function getSourceFilesFromTokensJsonForAlias(alias, theme) {
  const tokensPath = path.join(TOKENS_BASE, 'tokens.json');
  if (!fs.existsSync(tokensPath)) return null;

  const raw = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const tokenSetOrder = raw.$metadata?.tokenSetOrder || [];
  ensureTokenSourcesDir();

  const paletteToExclude = theme === 'light' ? PALETTE_DARK : PALETTE_LIGHT;
  const aliasSetKey = `${ALIAS_PREFIX}${alias}`;
  const modeSetKey = `${ALIAS_PREFIX}Mode`;

  // Collect sets to include, then reorder: Mode must come before the selected alias
  const setsToInclude = [];
  for (const setKey of tokenSetOrder) {
    if (setKey.startsWith('$')) continue;
    if (setKey === paletteToExclude) continue;
    if (setKey.startsWith(ALIAS_PREFIX) && setKey !== aliasSetKey && setKey !== modeSetKey) continue;
    setsToInclude.push(setKey);
  }

  // Reorder: put Mode before the selected brand alias so brand overrides Mode's defaults
  const modeIdx = setsToInclude.indexOf(modeSetKey);
  const aliasIdx = setsToInclude.indexOf(aliasSetKey);
  if (modeIdx !== -1 && aliasIdx !== -1 && modeIdx > aliasIdx) {
    setsToInclude.splice(modeIdx, 1);
    setsToInclude.splice(aliasIdx, 0, modeSetKey);
  }

  const paths = [];
  for (const setKey of setsToInclude) {
    const tokenSet = raw[setKey];
    if (!tokenSet) continue;

    const filePath = path.join(TOKEN_SOURCES_DIR, `${setKey}.json`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(tokenSet, null, 2));
    paths.push(filePath);
  }

  return paths;
}

function getSourceFiles() {
  const fromTokens = getSourceFilesFromTokensJson();
  if (fromTokens) return fromTokens;

  const metadataPath = path.join(TOKENS_BASE, '$metadata.json');
  let orderedKeys = [];

  if (fs.existsSync(metadataPath)) {
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      if (metadata.tokenSetOrder && Array.isArray(metadata.tokenSetOrder)) {
        orderedKeys = metadata.tokenSetOrder;
      }
    } catch (e) {
      console.warn('[build] Could not parse $metadata.json, using glob fallback:', e.message);
    }
  }

  if (orderedKeys.length === 0) {
    const allFiles = [];
    function walk(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (full.includes('.build-temp')) continue;
        if (e.isDirectory()) walk(full);
        else if (e.name.endsWith('.json') && e.name !== '$metadata.json') {
          allFiles.push(path.relative(TOKENS_BASE, full));
        }
      }
    }
    walk(TOKENS_BASE);
    orderedKeys = allFiles.map((f) => f.replace(/\.json$/, '')).sort();
  }

  const lightSources = [];
  const darkSources = [];

  for (const key of orderedKeys) {
    const filePath = path.join(TOKENS_BASE, `${key}.json`);
    const relPath = `${key}.json`;
    const lower = relPath.toLowerCase();

    if (key === '$metadata' || key.endsWith('/$metadata')) continue;
    if (!fs.existsSync(filePath)) continue;

    if (lower.includes('palette') && lower.includes('light')) {
      lightSources.push(filePath);
      continue;
    }
    if (lower.includes('palette') && lower.includes('dark')) {
      darkSources.push(filePath);
      continue;
    }

    lightSources.push(filePath);
    darkSources.push(filePath);
  }

  if (!lightSources.length) {
    throw new Error('No token files found. Add JSON files to Nexus-Source-Tokens/tokens/ or ensure 03 Palette ✅/light.json exists.');
  }
  const hasDarkPalette = darkSources.some((p) => p.toLowerCase().includes('palette') && p.toLowerCase().includes('dark'));
  if (!hasDarkPalette) {
    throw new Error('No dark palette found. Ensure 03 Palette ✅/dark.json exists for dark theme build.');
  }

  return { light: lightSources, dark: darkSources };
}

// Alias names from tokenSetOrder (02 Alias ✅/X) — used for per-alias builds
const ALIAS_NAMES = ['myQ', 'Community', 'LiftMaster Pro', 'Enterprise'];

/** Get source files filtered to a single alias (excludes other aliases so that alias wins) */
function getSourceFilesForAlias(alias) {
  const tokensPath = path.join(TOKENS_BASE, 'tokens.json');
  if (fs.existsSync(tokensPath)) {
    const lightPaths = getSourceFilesFromTokensJsonForAlias(alias, 'light');
    const darkPaths = getSourceFilesFromTokensJsonForAlias(alias, 'dark');
    if (lightPaths?.length && darkPaths?.length) {
      return { light: lightPaths, dark: darkPaths };
    }
  }

  const metadataPath = path.join(TOKENS_BASE, '$metadata.json');
  let orderedKeys = [];

  if (fs.existsSync(metadataPath)) {
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      if (metadata.tokenSetOrder && Array.isArray(metadata.tokenSetOrder)) {
        orderedKeys = metadata.tokenSetOrder;
      }
    } catch (e) {
      console.warn('[build] Could not parse $metadata.json:', e.message);
    }
  }

  if (orderedKeys.length === 0) {
    const allFiles = [];
    function walk(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (full.includes('.build-temp')) continue;
        if (e.isDirectory()) walk(full);
        else if (e.name.endsWith('.json') && e.name !== '$metadata.json') {
          allFiles.push(path.relative(TOKENS_BASE, full));
        }
      }
    }
    walk(TOKENS_BASE);
    orderedKeys = allFiles.map((f) => f.replace(/\.json$/, '')).sort();
  }

  const lightSources = [];
  const darkSources = [];

  for (const key of orderedKeys) {
    const filePath = path.join(TOKENS_BASE, `${key}.json`);
    const relPath = `${key}.json`;
    const lower = relPath.toLowerCase();

    if (key === '$metadata' || key.endsWith('/$metadata')) continue;
    if (!fs.existsSync(filePath)) continue;

    const aliasIdx = key.indexOf(ALIAS_PREFIX);
    if (aliasIdx !== -1) {
      const afterPrefix = key.slice(aliasIdx + ALIAS_PREFIX.length);
      const aliasKey = afterPrefix.split('/')[0]; // e.g. "Community" or "myQ"
      if (aliasKey !== alias && aliasKey !== 'Mode') continue;
    }

    if (lower.includes('palette') && lower.includes('light')) {
      lightSources.push(filePath);
      continue;
    }
    if (lower.includes('palette') && lower.includes('dark')) {
      darkSources.push(filePath);
      continue;
    }

    lightSources.push(filePath);
    darkSources.push(filePath);
  }

  if (!lightSources.length) {
    throw new Error(`No token files found for alias "${alias}".`);
  }
  const hasDarkPalette = darkSources.some((p) => p.toLowerCase().includes('palette') && p.toLowerCase().includes('dark'));
  if (!hasDarkPalette) {
    throw new Error('No dark palette found.');
  }

  return { light: lightSources, dark: darkSources };
}

const { light: SOURCE_FILES, dark: SOURCE_FILES_DARK } = getSourceFiles();

// Custom format to preserve typography composite tokens with metadata
StyleDictionary.registerFormat({
  name: 'json/nested-with-types',
  format: ({ dictionary }) => {
    // Helper to resolve token references like {Nexus.color.blue.500}
    function resolveReferences(value, tokens) {
      if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        const refPath = value.slice(1, -1).split('.');
        let resolved = tokens;
        
        for (const key of refPath) {
          if (resolved && resolved[key]) {
            resolved = resolved[key];
          } else {
            return value; // Can't resolve, return original
          }
        }
        
        // If we found a token object, get its $value
        if (resolved && typeof resolved === 'object' && resolved.$value) {
          return resolveReferences(resolved.$value, tokens);
        }
        
        return resolved;
      }
      
      // Recursively resolve references in objects
      if (typeof value === 'object' && value !== null) {
        const resolved = {};
        for (const key in value) {
          resolved[key] = resolveReferences(value[key], tokens);
        }
        return resolved;
      }
      
      return value;
    }
    
    // Get the raw tokens object
    const tokens = dictionary.tokens;
    
    // List of typography composite token groups to reorganize
    const typeStyleGroups = ['Headings', 'Subtitle', 'Body', 'label', 'link', 'caption', 'Button'];
    
    // Recursively process and resolve references
    function processTokens(obj) {
      const result = {};
      
      for (const key in obj) {
        if (key.startsWith('$')) {
          // Keep metadata properties
          result[key] = obj[key];
          continue;
        }
        
        const value = obj[key];
        
        if (value && typeof value === 'object') {
          // Check if this is a token (has $type and $value)
          if (value.$type && value.$value) {
            result[key] = {
              $type: value.$type,
              $value: resolveReferences(value.$value, tokens)
            };
          } else if (value.$value !== undefined) {
            // Token without $type
            result[key] = resolveReferences(value.$value, tokens);
          } else {
            // Nested group - recurse
            result[key] = processTokens(value);
          }
        } else {
          result[key] = value;
        }
      }
      
      return result;
    }
    
    const processed = processTokens(tokens);
    
    // Reorganize: Move typography-related tokens into organized folders
    // All blocks are defensive - skip if structure differs from expected
    
    // 1. Move typography composite tokens under "Type Styles" (Nexus-specific)
    if (processed && processed.Nexus && typeof processed.Nexus === 'object') {
      const typeStyles = {};
      
      typeStyleGroups.forEach(groupName => {
        if (processed.Nexus[groupName]) {
          typeStyles[groupName] = processed.Nexus[groupName];
          delete processed.Nexus[groupName];
        }
      });
      
      let textToken = null;
      if (processed.Nexus.textToken) {
        textToken = processed.Nexus.textToken;
        delete processed.Nexus.textToken;
      }
      
      if (Object.keys(typeStyles).length > 0 || textToken) {
        if (!processed.Nexus.typography) {
          processed.Nexus.typography = {};
        }
        if (Object.keys(typeStyles).length > 0) {
          processed.Nexus.typography['Type Styles'] = typeStyles;
        }
        if (textToken) {
          processed.Nexus.typography['textToken'] = textToken;
        }
      }
    }
    
    // 2. Move typography primitives (fontSize, lineHeights, etc.) under primitives - only if they exist at root
    const typographyPrimitives = {};
    const primitiveGroups = ['fontSize', 'lineHeights', 'letterSpacing', 'paragraphSpacing', 'paragraphIndent', 'textCase', 'textDecoration'];
    
    primitiveGroups.forEach(groupName => {
      if (processed && processed[groupName]) {
        typographyPrimitives[groupName] = processed[groupName];
        delete processed[groupName];
      }
    });
    
    if (Object.keys(typographyPrimitives).length > 0) {
      if (!processed.primitives) {
        processed.primitives = {};
      }
      processed.primitives.typography = typographyPrimitives;
    }
    
    // 3. Move color ramps under primitives['color ramps'] - only if Nexus.color structure exists
    if (processed && processed.Nexus && processed.Nexus.color && typeof processed.Nexus.color === 'object') {
      const colorRamps = {};
      const rampGroups = ['neutral', 'slate', 'deepBlue', 'blue', 'teal', 'green', 'lime', 'brightYellow', 'Red', 'Orange', 'Yellow', 'deepGreen'];
      
      rampGroups.forEach(rampName => {
        if (processed.Nexus.color[rampName]) {
          colorRamps[rampName] = processed.Nexus.color[rampName];
          delete processed.Nexus.color[rampName];
        }
      });
      
      if (Object.keys(colorRamps).length > 0) {
        if (!processed.primitives) {
          processed.primitives = {};
        }
        processed.primitives['color ramps'] = colorRamps;
      }
    }
    
    return JSON.stringify(processed, null, 2);
  }
});

// Custom transform for font weight normalization
// Maps keyword strings to numeric values
StyleDictionary.registerTransform({
  name: 'nexus/fontWeight/normalize',
  type: 'value',
  transitive: true,
  filter: (token) => {
    // Match any token with "fontWeight" in the path
    const path = token.path.join('.');
    return path.toLowerCase().includes('fontweight');
  },
  transform: (token) => {
    let value = token.$value || token.value;
    
    // If it's already a number, return it
    if (typeof value === 'number') {
      return value;
    }
    
    // If it's a string number, parse it
    if (typeof value === 'string') {
      // Check if it's a numeric string like "400"
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue)) {
        return numericValue;
      }
      
      // Map keyword strings to numeric values
      const weightMap = {
        'thin': 100,
        'hairline': 100,
        'extra light': 200,
        'extralight': 200,
        'ultra light': 200,
        'ultralight': 200,
        'light': 300,
        'normal': 400,
        'regular': 400,
        'medium': 500,
        'semi bold': 600,
        'semibold': 600,
        'demi bold': 600,
        'demibold': 600,
        'bold': 700,
        'extra bold': 800,
        'extrabold': 800,
        'ultra bold': 800,
        'ultrabold': 800,
        'black': 900,
        'heavy': 900,
        'extra black': 950,
        'extrablack': 950,
        'ultra black': 950,
        'ultrablack': 950
      };
      
      const normalized = value.toLowerCase().trim();
      if (weightMap[normalized]) {
        return weightMap[normalized];
      }
      
      console.warn(`[nexus/fontWeight/normalize] Unknown font weight keyword: ${value} for ${token.path.join('.')}`);
    }
    
    return value;
  }
});

// Build configuration for CSS and decomposed JSON (uses tokens-studio preprocessor)
const sdExpanded = new StyleDictionary({
  source: SOURCE_FILES,
  preprocessors: ['tokens-studio'],
  log: {
    warnings: 'warn',
    verbosity: 'default'
  },
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      transforms: [
        'ts/descriptionToComment',
        'ts/size/px',
        'ts/opacity',
        'ts/size/lineheight',
        'ts/resolveMath',
        'ts/size/css/letterspacing',
        'ts/color/css/hexrgba',
        'ts/color/modifiers',
        'name/kebab',
        'nexus/opacity/normalize',
        'nexus/fontWeight/normalize'
      ],
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens-light.css',
          format: 'css/variables',
          options: {
            outputReferences: false
          }
        }
      ]
    },
    json: {
      transformGroup: 'tokens-studio',
      transforms: [
        'name/kebab'
      ],
      buildPath: 'dist/json/',
      files: [
        {
          destination: 'tokens-metadata.json',
          format: 'json'
        }
      ]
    }
  }
});

// Build configuration for dark palette CSS
const sdExpandedDark = new StyleDictionary({
  source: SOURCE_FILES_DARK,
  preprocessors: ['tokens-studio'],
  log: {
    warnings: 'warn',
    verbosity: 'default'
  },
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      transforms: [
        'ts/descriptionToComment',
        'ts/size/px',
        'ts/opacity',
        'ts/size/lineheight',
        'ts/resolveMath',
        'ts/size/css/letterspacing',
        'ts/color/css/hexrgba',
        'ts/color/modifiers',
        'name/kebab',
        'nexus/opacity/normalize',
        'nexus/fontWeight/normalize'
      ],
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens-dark.css',
          format: 'css/variables',
          options: {
            outputReferences: false
          }
        }
      ]
    }
  }
});

// Build configuration for preserved composite tokens (NO tokens-studio preprocessor)
const sdPreserved = new StyleDictionary({
  source: SOURCE_FILES,
  log: {
    warnings: 'warn',
    verbosity: 'default'
  },
  platforms: {
    'json-preserved': {
      transforms: [
        'name/kebab'
      ],
      buildPath: 'dist/json/',
      files: [
        {
          destination: 'tokens-preserved.json',
          format: 'json/nested-with-types'
        },
        {
          destination: 'tokens-preserved-light.json',
          format: 'json/nested-with-types'
        }
      ]
    }
  }
});

// Build configuration for preserved dark composite tokens
const sdPreservedDark = new StyleDictionary({
  source: SOURCE_FILES_DARK,
  log: {
    warnings: 'warn',
    verbosity: 'default'
  },
  platforms: {
    'json-preserved': {
      transforms: [
        'name/kebab'
      ],
      buildPath: 'dist/json/',
      files: [
        {
          destination: 'tokens-preserved-dark.json',
          format: 'json/nested-with-types'
        }
      ]
    }
  }
});

/** Slug for alias (used in filenames and data-alias) */
function aliasToSlug(alias) {
  return alias.toLowerCase().replace(/\s+/g, '-');
}

// Combine per-alias CSS into single tokens.css with [data-alias="X"] and [data-theme="dark"][data-alias="X"] blocks
function combineTokensCssPerAlias(aliasCssMap) {
  const cssDir = path.join(process.cwd(), 'dist', 'css');
  const outPath = path.join(cssDir, 'tokens.css');
  const parts = [];

  for (const [alias, { light, dark }] of Object.entries(aliasCssMap)) {
    const lightMatch = light.match(/:root\s*\{([\s\S]*)\}/);
    const darkMatch = dark.match(/:root\s*\{([\s\S]*)\}/);
    const lightVars = lightMatch ? lightMatch[1].trim() : light;
    const darkVars = darkMatch ? darkMatch[1].trim() : dark;
    const slug = aliasToSlug(alias);
    parts.push(`[data-alias="${slug}"] {\n  ${lightVars.split('\n').join('\n  ')}\n}`);
    parts.push(`[data-theme="dark"][data-alias="${slug}"] {\n  ${darkVars.split('\n').join('\n  ')}\n}`);
  }

  fs.writeFileSync(outPath, parts.join('\n\n'));
}

// Clean and build default (myQ) for backward compatibility
await sdExpanded.cleanAllPlatforms();
await sdExpanded.buildAllPlatforms();

console.log('\n📦 Building dark palette CSS...');
await sdExpandedDark.buildAllPlatforms();

console.log('\n📦 Building preserved composite tokens...');
await sdPreserved.buildAllPlatforms();
await sdPreservedDark.buildAllPlatforms();

// Per-alias builds: CSS and preserved JSON for each theme
const aliasCssMap = {};
const jsonDir = path.join(process.cwd(), 'dist', 'json');
const cssDir = path.join(process.cwd(), 'dist', 'css');

for (const alias of ALIAS_NAMES) {
  console.log(`\n📦 Building alias: ${alias}...`);
  const { light: srcLight, dark: srcDark } = getSourceFilesForAlias(alias);
  const slug = aliasToSlug(alias);

  const sdAliasLight = new StyleDictionary({
    source: srcLight,
    preprocessors: ['tokens-studio'],
    log: { warnings: 'warn', verbosity: 'default' },
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        transforms: [
          'ts/descriptionToComment', 'ts/size/px', 'ts/opacity', 'ts/size/lineheight',
          'ts/resolveMath', 'ts/size/css/letterspacing', 'ts/color/css/hexrgba', 'ts/color/modifiers',
          'name/kebab', 'nexus/opacity/normalize', 'nexus/fontWeight/normalize'
        ],
        buildPath: cssDir + '/',
        files: [{ destination: `tokens-${slug}-light.css`, format: 'css/variables', options: { outputReferences: false } }]
      }
    }
  });

  const sdAliasDark = new StyleDictionary({
    source: srcDark,
    preprocessors: ['tokens-studio'],
    log: { warnings: 'warn', verbosity: 'default' },
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        transforms: [
          'ts/descriptionToComment', 'ts/size/px', 'ts/opacity', 'ts/size/lineheight',
          'ts/resolveMath', 'ts/size/css/letterspacing', 'ts/color/css/hexrgba', 'ts/color/modifiers',
          'name/kebab', 'nexus/opacity/normalize', 'nexus/fontWeight/normalize'
        ],
        buildPath: cssDir + '/',
        files: [{ destination: `tokens-${slug}-dark.css`, format: 'css/variables', options: { outputReferences: false } }]
      }
    }
  });

  const sdPreservedAliasLight = new StyleDictionary({
    source: srcLight,
    log: { warnings: 'warn', verbosity: 'default' },
    platforms: {
      'json-preserved': {
        transforms: ['name/kebab'],
        buildPath: jsonDir + '/',
        files: [{ destination: `tokens-preserved-${slug}-light.json`, format: 'json/nested-with-types' }]
      }
    }
  });

  const sdPreservedAliasDark = new StyleDictionary({
    source: srcDark,
    log: { warnings: 'warn', verbosity: 'default' },
    platforms: {
      'json-preserved': {
        transforms: ['name/kebab'],
        buildPath: jsonDir + '/',
        files: [{ destination: `tokens-preserved-${slug}-dark.json`, format: 'json/nested-with-types' }]
      }
    }
  });

  await sdAliasLight.buildAllPlatforms();
  await sdAliasDark.buildAllPlatforms();
  await sdPreservedAliasLight.buildAllPlatforms();
  await sdPreservedAliasDark.buildAllPlatforms();

  aliasCssMap[alias] = {
    light: fs.readFileSync(path.join(cssDir, `tokens-${slug}-light.css`), 'utf8'),
    dark: fs.readFileSync(path.join(cssDir, `tokens-${slug}-dark.css`), 'utf8')
  };
}

console.log('\n📦 Combining tokens.css (all aliases)...');
combineTokensCssPerAlias(aliasCssMap);

console.log('\n✅ Build complete! dist/css/tokens.css, dist/json/tokens-preserved-{alias}-light.json, tokens-preserved-{alias}-dark.json');
