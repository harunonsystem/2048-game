# Agent Guidelines for 2048-Game

## Build/Test Commands
```bash
npm run dev          # Start development server at http://localhost:5173
npm run build        # Build production bundle 
npm run preview      # Preview production build
npm run test         # Run all tests with vitest
npm run test:ui      # Run tests with UI interface
npm run test:run     # Run tests once without watch mode
npm run test:e2e     # Run end-to-end tests with Playwright
npm run test:e2e:ui  # Run e2e tests with UI
npm run test:e2e:debug  # Debug e2e tests with Playwright
npm run test:e2e:headed # Run e2e tests in headed mode
npm run test:e2e:chrome # Run e2e tests in Chrome only
npm run test:e2e:firefox # Run e2e tests in Firefox only
npm run test:e2e:mobile # Run e2e tests on mobile browsers
npm run typecheck    # Check TypeScript types
npm run test -- tests/game.test.ts  # Run single test file
```

## Code Style & Standards
- **Language**: TypeScript with strict mode enabled (noUnusedLocals, exactOptionalPropertyTypes)
- **Imports**: Use relative paths for local files, named imports from types.ts
- **Types**: Define in src/types.ts, use strict typing (no `any`), prefer interfaces over types
- **Classes**: Use private/public modifiers, async/await for promises, readonly for constants
- **DOM**: Use non-null assertion (!) for required elements after null checks
- **Naming**: camelCase for variables/methods, PascalCase for types/interfaces
- **Arrays**: Use `as const` for readonly arrays, prefer readonly types when immutable
- **Error Handling**: Graceful fallbacks, no silent failures in critical paths
- **Environment**: Use `import.meta.env.PROD` for production checks
- **Comments**: Minimal inline comments, prefer self-documenting code

## Architecture
- Game logic in `Game2048` class (src/main.ts)
- Type definitions in src/types.ts  
- Tests use TestableGame2048 wrapper with exposed private methods
- Translations loaded from src/translations.json with fallback support