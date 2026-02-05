import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

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
    
    // 1. Move typography composite tokens under "Type Styles"
    if (processed.Nexus) {
      const typeStyles = {};
      
      // Collect all type style groups from Nexus
      typeStyleGroups.forEach(groupName => {
        if (processed.Nexus[groupName]) {
          typeStyles[groupName] = processed.Nexus[groupName];
          delete processed.Nexus[groupName];
        }
      });
      
      // Move textToken under typography as well
      let textToken = null;
      if (processed.Nexus.textToken) {
        textToken = processed.Nexus.textToken;
        delete processed.Nexus.textToken;
      }
      
      // Ensure typography object exists
      if (!processed.Nexus.typography) {
        processed.Nexus.typography = {};
      }
      
      // Add Type Styles folder under typography if we have any
      if (Object.keys(typeStyles).length > 0) {
        processed.Nexus.typography['Type Styles'] = typeStyles;
      }
      
      // Add textToken under typography after Type Styles
      if (textToken) {
        processed.Nexus.typography['textToken'] = textToken;
      }
    }
    
    // 2. Move typography primitives (fontSize, lineHeights, etc.) under a primitives folder
    const typographyPrimitives = {};
    const primitiveGroups = ['fontSize', 'lineHeights', 'letterSpacing', 'paragraphSpacing', 'paragraphIndent', 'textCase', 'textDecoration'];
    
    primitiveGroups.forEach(groupName => {
      if (processed[groupName]) {
        typographyPrimitives[groupName] = processed[groupName];
        delete processed[groupName];
      }
    });
    
    // Create primitives structure if we have any typography primitives
    if (Object.keys(typographyPrimitives).length > 0) {
      if (!processed.primitives) {
        processed.primitives = {};
      }
      processed.primitives.typography = typographyPrimitives;
    }
    
    // 3. Move color ramps under primitives['color ramps']
    if (processed.Nexus && processed.Nexus.color) {
      const colorRamps = {};
      // Include all primitive color ramps (scales with numeric values like 50, 100, 200, etc.)
      const rampGroups = ['neutral', 'slate', 'deepBlue', 'blue', 'teal', 'green', 'lime', 'brightYellow', 'Red', 'Orange', 'Yellow', 'deepGreen'];
      
      rampGroups.forEach(rampName => {
        if (processed.Nexus.color[rampName]) {
          colorRamps[rampName] = processed.Nexus.color[rampName];
          delete processed.Nexus.color[rampName];
        }
      });
      
      // Add color ramps under primitives if we have any
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
  source: [
    'Nexus-Source-Tokens/tokens/01 Primitive ✅/Mode 1.json',
    'Nexus-Source-Tokens/tokens/01 rem ✅/Mode 1.json',
    'Nexus-Source-Tokens/tokens/02 Alias ✅/myQ.json',
    'Nexus-Source-Tokens/tokens/03 Palette ✅/light.json',
    'Nexus-Source-Tokens/tokens/03 Responsive ✅/Larger Breakpoint.json',
    'Nexus-Source-Tokens/tokens/03 Mapped ✅/Mode 1.json'
  ],
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
          destination: 'tokens.css',
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

// Build configuration for preserved composite tokens (NO tokens-studio preprocessor)
const sdPreserved = new StyleDictionary({
  source: [
    'Nexus-Source-Tokens/tokens/01 Primitive ✅/Mode 1.json',
    'Nexus-Source-Tokens/tokens/01 rem ✅/Mode 1.json',
    'Nexus-Source-Tokens/tokens/02 Alias ✅/myQ.json',
    'Nexus-Source-Tokens/tokens/03 Palette ✅/light.json',
    'Nexus-Source-Tokens/tokens/03 Responsive ✅/Larger Breakpoint.json',
    'Nexus-Source-Tokens/tokens/03 Mapped ✅/Mode 1.json'
  ],
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
        }
      ]
    }
  }
});

// Clean and build both configurations
await sdExpanded.cleanAllPlatforms();
await sdExpanded.buildAllPlatforms();

console.log('\n📦 Building preserved composite tokens...');
await sdPreserved.buildAllPlatforms();

console.log('\n✅ Build complete! Check dist/css/tokens.css and dist/json/tokens-preserved.json');
