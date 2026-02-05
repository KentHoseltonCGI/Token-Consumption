# Technical Decisions & Questions

## Overview

This document tracks key technical decisions that need to be made for the Token Consumption Pipeline, along with open questions that require resolution.

**⚠️ IMPORTANT:** Many foundational decisions are **locked** per [CONSTRAINTS.md](./CONSTRAINTS.md). This document tracks remaining decisions within those constraints.

### Decision 1: Build Tool Selection

**Status:** 🟢 LOCKED (See CONSTRAINTS.md)  
**Decision:** Style Dictionary (v5+) + @tokens-studio/sd-transforms

**Rationale:**
- Industry standard with Tokens Studio compatibility
- @tokens-studio/sd-transforms handles DTCG format and common quirks
- Locked for MVP to prevent overengineering
- Custom transforms added only when necessary for normalization policies

**Remaining Work:**
- Configure Style Dictionary for CSS variable output
- Implement custom transforms for opacity and font weight normalization per CONSTRAINTS.md policies
   - ✅ Full control over transformation logic
   - ✅ Tailored to exact needs
   - ✅ No external dependencies on transform logic
   - ❌ More development time
   - ❌ Must implement all formatters
   - ❌ Maintenance burden

3. **Hybrid Approach**
   - ✅ Use Token Transformer for Tokens Studio compatibility
   - ✅ Use Style Dictionary for platform output
   - ✅ Best of both worlds
   - ❌ Two tools to maintain
   - ❌ Complexity in pipeline

**Recommendation:** Start with hybrid approach (Token Transformer → Style Dictionary) for faster initial implementation, evaluate custom solution if limitations are discovered.

### Decision 2: Package Structure

**Status:** 🟡 Pending  
**Decision Needed:** Single package vs monorepo vs separate packages

**Options:**

1. **Single Package**
   ```
   @nexus/design-tokens
   ├── web/
   ├── ios/
   ├── android/
   └── json/
   ```
   - ✅ Simple versioning
   - ✅ Easy to publish
   - ❌ Large package size
   - ❌ Consumers get all platforms

2. **Monorepo with Multiple Packages**
   ```
   @nexus/tokens-web
   @nexus/tokens-ios
   @nexus/tokens-android
   @nexus/tokens-core
   ```
   - ✅ Platform-specific dependencies
   - ✅ Smaller package sizes
   - ✅ Independent versioning possible
   - ❌ More complex publishing
   - ❌ Version synchronization challenges

3. **Separate Repositories**
   - ✅ Complete platform independence
   - ❌ Difficult to maintain consistency
   - ❌ Increased overhead

**Recommendation:** Monorepo with multiple packages using a tool like Turborepo or Nx.

### Decision 3: Configuration Format

**Status:** 🟡 Pending  
**Decision Needed:** Configuration file format and structure

**Options:**

1. **JSON Configuration**
   - ✅ Simple and portable
   - ❌ No comments
   - ❌ No logic

2. **JavaScript/TypeScript Configuration**
   - ✅ Programmable
   - ✅ Comments supported
   - ✅ Can import/export
   - ❌ Requires runtime

3. **YAML Configuration**
   - ✅ Comments supported
   - ✅ Human-readable
   - ❌ Extra dependency

**Recommendation:** TypeScript configuration for flexibility, with JSON schema for validation.

### Decision 4: Token Reference Syntax

**Status:** 🟡 Pending - Requires Source Analysis  
**Decision Needed:** How to handle token references in transformations

**Action Required:** Analyze source files to understand current reference format, then decide if transformation is needed.

### Decision 5: Versioning Strategy

**Status:** 🟡 Pending  
**Decision Needed:** How to version token releases

**Options:**

1. **Semantic Versioning**
   - Major: Breaking changes (token removed, renamed)
   - Minor: New tokens added
   - Patch: Value changes only

2. **Calendar Versioning**
   - e.g., 2025.01.0
   - Time-based releases

3. **Incremental**
   - Simple incrementing version

**Recommendation:** Semantic versioning with automated changelog generation.

### Decision 6: TypeScript Support

**Status:** 🟢 Decided  
**Decision:** Use TypeScript for build tooling and generate TypeScript definitions for consumers

**Rationale:**
- Type safety in transformation logic
- Better IDE support for token consumption
- Catches errors at compile time
- Industry best practice

### Decision 7: Testing Strategy

**Status:** 🟡 Pending  
**Decision Needed:** Testing framework and approach

**Options:**

1. **Jest**
   - ✅ Popular, well-documented
   - ✅ Built-in mocking
   - ❌ Slower than alternatives

2. **Vitest**
   - ✅ Fast
   - ✅ Vite integration
   - ✅ Jest-compatible API

3. **Node Test Runner**
   - ✅ Native to Node.js
   - ❌ Less features

**Recommendation:** Vitest for speed and modern features.

## Open Questions

### Source Token Questions

1. **Q:** What is the exact token reference syntax used in the source files?  
   **Status:** 🔴 Unanswered  
   **Action:** Analyze token files for reference patterns

2. **Q:** Are there any circular reference patterns?  
   **Status:** 🔴 Unanswered  
   **Action:** Build dependency graph and check

3. **Q:** What is the total token count across all sets?  
   **Status:** 🔴 Unanswered  
   **Action:** Parse and count all tokens

4. **Q:** Are all brand aliases complete or do some inherit defaults?  
   **Status:** 🔴 Unanswered  
   **Action:** Compare brand token files

5. **Q:** What is the rem base size assumption?  
   **Status:** 🔴 Unanswered  
   **Action:** Check documentation or make decision

### Platform Output Questions

6. **Q:** What naming conventions should each platform use?  
   **Status:** 🔴 Unanswered  
   **Action:** Research platform best practices

7. **Q:** Should iOS support both UIKit and SwiftUI?  
   **Status:** 🔴 Unanswered  
   **Action:** Determine target iOS platforms

8. **Q:** What Android API levels should be supported?  
   **Status:** 🔴 Unanswered  
   **Action:** Confirm with Android team

9. **Q:** Should CSS output include fallbacks for older browsers?  
   **Status:** 🔴 Unanswered  
   **Action:** Define browser support matrix

### Integration Questions

10. **Q:** How will consuming applications be notified of token updates?  
    **Status:** 🔴 Unanswered  
    **Action:** Design notification system

11. **Q:** Should the pipeline support partial imports (e.g., only colors)?  
    **Status:** 🔴 Unanswered  
    **Action:** Evaluate tree-shaking support

12. **Q:** What is the expected update frequency for tokens?  
    **Status:** 🔴 Unanswered  
    **Action:** Consult with design team

### Performance Questions

13. **Q:** What is acceptable build time for the pipeline?  
    **Status:** 🔴 Unanswered  
    **Action:** Set performance benchmarks

14. **Q:** Should incremental builds be supported?  
    **Status:** 🟡 Pending  
    **Action:** Evaluate necessity vs complexity

### Documentation Questions

15. **Q:** What level of documentation is needed for each token?  
    **Status:** 🔴 Unanswered  
    **Action:** Review token $description fields

16. **Q:** Should visual documentation (color swatches, etc.) be generated?  
    **Status:** 🟡 Pending  
    **Action:** Evaluate tooling options

## Assumptions

Current assumptions that should be validated:

1. **Assumption:** Source tokens follow W3C Design Tokens specification  
   **Risk:** Medium - may require custom parsing  
   **Validation:** Read spec and compare to source files

2. **Assumption:** All platforms need all token types  
   **Risk:** Low - can filter per platform  
   **Validation:** Confirm with platform teams

3. **Assumption:** Token updates will be backward compatible most of the time  
   **Risk:** Medium - may need migration tooling  
   **Validation:** Establish versioning policy

4. **Assumption:** One source of truth (Figma) for all tokens  
   **Risk:** Low - standard practice  
   **Validation:** Confirm with design team

5. **Assumption:** Automated builds can run on every token change  
   **Risk:** Low - modern CI/CD handles this  
   **Validation:** Test CI/CD pipeline

## Priority Assessment

### High Priority Decisions (Blocking)
- [ ] Build tool selection (needed to start implementation)
- [ ] Token reference syntax analysis (needed for parser)
- [ ] Package structure (affects project setup)

### Medium Priority Decisions (Phase 2-3)
- [ ] Platform naming conventions
- [ ] Testing framework
- [ ] Configuration format

### Low Priority Decisions (Phase 4+)
- [ ] Visual documentation generation
- [ ] Notification system
- [ ] Advanced features

## Next Actions

1. Analyze source token files to answer token structure questions
2. Make build tool selection decision
3. Define package structure
4. Research platform naming conventions
5. Set up initial project with TypeScript and chosen tools

## Notes

This document should be updated as decisions are made and questions are answered. Keep the status indicators current:
- 🔴 Unanswered / Not Started
- 🟡 Pending / In Progress
- 🟢 Decided / Resolved
