# Token Consumption Pipeline - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Source: Figma/Tokens Studio              │
│                  Nexus-Source-Tokens/tokens/                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Token Parser & Validator                   │
│  - Read JSON token files                                     │
│  - Validate token structure                                  │
│  - Resolve token references                                  │
│  - Build token dependency graph                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Token Transformation Engine                 │
│  - Apply platform-specific transformations                   │
│  - Handle token aliasing and references                      │
│  - Calculate derived values                                  │
│  - Apply naming conventions per platform                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Output Formatters                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Web      │  │    Mobile    │  │   JSON/API   │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ CSS Variables│  │ iOS (Swift)  │  │ JSON Schema  │     │
│  │ SCSS Files   │  │ Android (XML)│  │ Design Tokens│     │
│  │ JS/TS Modules│  │ React Native │  │ Spec Format  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Distribution Packages                     │
│  - npm packages (@nexus/tokens-web, @nexus/tokens-mobile)   │
│  - Platform-specific repositories                            │
│  - CDN-hosted files                                          │
└─────────────────────────────────────────────────────────────┘
```

## Token Organization

### Token Hierarchy

1. **Primitive Tokens (01 Primitive ✅)**
   - Raw values (hex colors, pixel values, font families)
   - No references to other tokens
   - Foundation of the entire token system

2. **Rem-based Tokens (01 rem ✅)**
   - Responsive sizing using rem units
   - May reference primitive tokens

3. **Alias Tokens (02 Alias ✅)**
   - Brand-specific variations
   - Reference primitive and rem tokens
   - Brands: myQ, Community, LiftMaster Pro, Enterprise

4. **Palette Tokens (03 Palette ✅)**
   - Theme-specific color assignments
   - Light and dark mode variations
   - Reference primitive color tokens

5. **Mapped Tokens (03 Mapped ✅)**
   - Semantic token mappings
   - Map abstract concepts to concrete values
   - Reference alias and palette tokens

6. **Responsive Tokens (03 Responsive ✅)**
   - Breakpoint-specific values
   - Mobile and larger breakpoint configurations

## Token Resolution Strategy

### Dependency Resolution
```
Primitive → rem → Alias → Palette → Mapped → Responsive
                                         ↓
                                   Final Output
```

### Token Reference Format
- Tokens may reference other tokens using dot notation or specific reference syntax
- Resolution must follow the token set order defined in `$metadata.json`
- Circular references must be detected and reported as errors

## Build Pipeline Architecture

### Input Phase
1. Read token set order from `$metadata.json`
2. Load token files in hierarchical order
3. Validate JSON structure and token format

### Processing Phase
1. Parse token definitions
2. Build dependency graph
3. Resolve all token references
4. Apply transformations per platform
5. Calculate derived values

### Output Phase
1. Format tokens for each target platform
2. Generate type definitions (TypeScript)
3. Create documentation
4. Package for distribution
5. Generate changelog

## File Structure (Proposed)

```
Token-Consumption/
├── src/
│   ├── parsers/          # Token file parsers
│   ├── transformers/     # Platform-specific transformers
│   ├── formatters/       # Output format generators
│   ├── validators/       # Token validation logic
│   └── utils/            # Shared utilities
├── dist/                 # Generated output files
│   ├── web/
│   ├── mobile/
│   └── json/
├── tests/                # Test files
├── docs/                 # Generated documentation
├── scripts/              # Build and utility scripts
└── config/               # Configuration files
```

## Technology Requirements

### Core Requirements
- Node.js runtime (v18+)
- TypeScript for type safety
- JSON schema validation
- File system operations
- String manipulation utilities

### Recommended Tools
- **Style Dictionary:** Token transformation framework
- **Token Transformer:** Tokens Studio format support
- **Prettier:** Code formatting
- **ESLint:** Code quality
- **Jest/Vitest:** Testing framework
- **Typedoc:** Documentation generation

## Data Flow

```
Source JSON Files
      ↓
Token Parser (validates & reads)
      ↓
Token Registry (stores all tokens)
      ↓
Reference Resolver (resolves dependencies)
      ↓
Transformer (applies platform rules)
      ↓
Formatter (generates output)
      ↓
Validator (verifies output)
      ↓
Writer (saves to dist/)
```

## Error Handling

### Validation Errors
- Invalid JSON syntax
- Missing required token properties
- Invalid token references
- Circular dependencies
- Type mismatches

### Build Errors
- Missing source files
- File system errors
- Transformation failures
- Output generation failures

## Performance Considerations

- Cache parsed tokens to avoid redundant processing
- Parallelize independent transformations
- Incremental builds (only process changed tokens)
- Minimize file I/O operations
