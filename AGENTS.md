# Agent Guidelines for 2048-Game

## Build/Test Commands
```bash
pnpm dev              # Start dev server at http://localhost:5173
pnpm build            # Build production bundle
pnpm test:run         # Run all tests once (non-watch)
pnpm test -- path/to/test.ts  # Run single test file
pnpm test:e2e         # Run end-to-end tests
pnpm typecheck        # Check TypeScript types
```

## Code Style & Standards
- **TypeScript**: Strict mode (noUnusedLocals, exactOptionalPropertyTypes), no `any`
- **Imports**: Relative paths for local files, named imports from types.ts
- **Types**: Define interfaces in src/types.ts, prefer interfaces over types
- **Classes**: Use private/public modifiers, async/await for async code, readonly for constants
- **DOM**: Non-null assertion (!) after null checks only for required elements
- **Naming**: camelCase for functions/variables, PascalCase for types/interfaces/classes
- **Arrays**: Use `as const` for readonly arrays, prefer readonly types
- **Error Handling**: Graceful fallbacks, no silent failures in critical code paths
- **Environment**: Use `import.meta.env.PROD` for production-specific logic
- **Comments**: Minimal inline comments, prefer self-documenting code
- **Formatting**: Run `pnpm test:run` to verify code works before committing

## Architecture
- Game logic: `Game2048` class (src/main.ts)
- Types: src/types.ts (all game interfaces)
- Tests: vitest 4.0.7, TestableGame2048 wrapper exposes private methods
- i18n: src/translations.json with fallback support
- E2E: Playwright tests in tests/e2e/ with page objects