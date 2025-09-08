# Agent Guidelines for 2048-Game

## Build/Test Commands
```bash
npm run dev          # Start development server at http://localhost:5173
npm run build        # Build production bundle 
npm run preview      # Preview production build
npm run test         # Run all tests with vitest
npm run test:ui      # Run tests with UI interface
npm run test:run     # Run tests once without watch mode
npm run typecheck    # Check TypeScript types
npm run test -- tests/game.test.ts  # Run single test file
```

## Code Style & Standards
- **Language**: TypeScript with strict mode enabled
- **Imports**: Use relative paths for local files, named imports from types.ts
- **Types**: Define in src/types.ts, use strict typing (no `any`), prefer interfaces
- **Classes**: Use private/public modifiers, async/await for promises
- **DOM**: Use non-null assertion (!) for required elements after null checks
- **Naming**: camelCase for variables/methods, PascalCase for types/interfaces
- **Error Handling**: Graceful fallbacks, no silent failures in critical paths
- **Environment**: Use `import.meta.env.PROD` for production checks

## Architecture
- Game logic in `Game2048` class (src/main.ts)
- Type definitions in src/types.ts  
- Tests use TestableGame2048 wrapper with exposed private methods
- Translations loaded from src/translations.json with fallback support