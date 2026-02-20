# React Compiler Audit — @almadar/ui

**Date:** 2026-02-20
**Plugin:** `eslint-plugin-react-compiler` (warn level)
**Total warnings:** 16 across 10 files
**Blocking issues:** 0

## Summary

The React Compiler ESLint plugin was run against all `packages/almadar-ui/` source files. All findings are set to `warn` level. None are blocking — the codebase is compatible with the React Compiler with minor caveats documented below.

## Findings by Category

### 1. Conditional Hook Calls (4 warnings)

| File | Line | Issue |
|------|------|-------|
| `components/molecules/ButtonGroup.tsx` | 91, 105 | `useEventBus()` called inside a mapped callback |
| `components/molecules/WizardNavigation.tsx` | 28 | Hook called conditionally |
| `components/organisms/DataTable.tsx` | 250 | Hook called conditionally |

**Impact:** Low — these components work correctly at runtime. The compiler will skip optimizing these specific components but won't break them.

**Fix:** Lift hook calls above conditionals/loops. Deferring to Phase 2+ as it requires refactoring component structure.

### 2. Skipped Optimization — ESLint Rules Disabled (7 warnings)

| File | Lines | Issue |
|------|-------|-------|
| `components/organisms/game/IsometricCanvas.tsx` | 63, 90, 112, 188 | `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` disabled |
| `hooks/useOrbitalHistory.ts` | 209, 215 | `react-hooks/exhaustive-deps` disabled |
| `hooks/useUIEvents.ts` | 69 | `react-hooks/exhaustive-deps` disabled |

**Impact:** None — the compiler skips these components entirely, falling back to standard React behavior. These eslint-disable comments were intentional (complex dependency management in game engine hooks and orbital history diffing).

**Fix:** Remove eslint-disable and fix deps. Low priority — game hooks have complex dependency chains that were intentionally excluded.

### 3. Mutation Warnings (2 warnings)

| File | Line | Issue |
|------|------|-------|
| `components/organisms/game/IsometricCanvas.tsx` | 839 | Mutating return value |
| `components/organisms/game/three/Scene3D.tsx` | 52 | Mutating return value |

**Impact:** Low — game engine components that mutate Three.js/canvas objects. This is standard practice in game rendering loops.

**Fix:** N/A — these are legitimate mutations of game engine objects (camera positions, scene graphs) that are not React state. Could wrap in `useRef` for clarity.

### 4. Post-Render Variable Reassignment (1 warning)

| File | Line | Issue |
|------|------|-------|
| `components/organisms/Chart.tsx` | 147 | Reassigning variable after render |

**Impact:** Low — chart dimension calculation that runs post-render.

**Fix:** Move to `useState` or `useRef`. Deferring.

### 5. External Variable Write (1 warning)

| File | Line | Issue |
|------|------|-------|
| `hooks/useGitHub.ts` | 95 | Writing to module-level variable |

**Impact:** Low — caching pattern for GitHub API token.

**Fix:** Move to `useRef` or context. Deferring.

### 6. Non-Literal Dependency Array (1 warning)

| File | Line | Issue |
|------|------|-------|
| `components/organisms/DataTable.tsx` | 370 | `useMemo` deps not an array literal |

**Impact:** Low — computed dependency array for memoized column config.

**Fix:** Inline the dependency array. Deferring.

## Conclusion

All 16 warnings are non-blocking. The React Compiler will successfully optimize the vast majority of `@almadar/ui` components. The 10 affected components will fall back to standard React rendering — no runtime errors or behavior changes.

Priority fixes for full compiler optimization:
1. **High:** Fix conditional hook calls in ButtonGroup, WizardNavigation, DataTable (3 files)
2. **Medium:** Remove eslint-disable comments in IsometricCanvas, useOrbitalHistory, useUIEvents (3 files)
3. **Low:** Fix mutations and variable patterns in game components (4 files)
