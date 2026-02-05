import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

// Register Tokens Studio transforms
// This adds support for DTCG format and token references
register(StyleDictionary);

// Custom preprocessor to exclude typography composite tokens for MVP
StyleDictionary.registerPreprocessor({
  name: 'exclude-typography-composites',
  preprocessor: (dictionary) => {
    // Recursively filter out typography type tokens
    function filterTypography(obj) {
      if (!obj || typeof obj !== 'object') return obj;
      
      const filtered = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip if this token is of type typography
        if (value?.$type === 'typography') {
          console.log(`[MVP] Excluding typography composite: ${key}`);
          continue;
        }
        
        // Recurse for nested objects
        if (typeof value === 'object' && value !== null && !value.$value) {
          filtered[key] = filterTypography(value);
        } else {
          filtered[key] = value;
        }
      }
      return filtered;
    }
    
    return filterTypography(dictionary);
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

// Build configuration
const sd = new StyleDictionary({
  source: [
    'Nexus-Source-Tokens/tokens/01 Primitive ✅/Mode 1.json',
    'Nexus-Source-Tokens/tokens/01 rem ✅/Mode 1.json',
    'Nexus-Source-Tokens/tokens/02 Alias ✅/myQ.json',
    'Nexus-Source-Tokens/tokens/03 Palette ✅/light.json',
    'Nexus-Source-Tokens/tokens/03 Mapped ✅/Mode 1.json'
  ],
  preprocessors: ['exclude-typography-composites', 'tokens-studio'],
  log: {
    warnings: 'warn', // Show warnings but don't fail
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
        'nexus/opacity/normalize',    // Our custom opacity transform
        'nexus/fontWeight/normalize'   // Our custom font weight transform
      ],
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: false  // Resolve all references to final values
          }
        }
      ]
    }
  }
});

// Clean and build
await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();

console.log('\n✅ Build complete! Check dist/css/tokens.css');
