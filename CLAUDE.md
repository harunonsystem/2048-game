# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern 2048 puzzle game built with **TypeScript, Vite + npm** and deployed to **Cloudflare Workers**. Players slide numbered tiles on a 4×4 grid to combine them and reach the target tile (2048, 4096, etc). Features responsive design, touch controls, smooth animations, internationalization, and local storage persistence.

## Essential Commands

### Development
```bash
npm run dev         # Start Vite dev server at http://localhost:5173
npm run build       # Build for production 
npm run preview     # Preview production build
npm run typecheck   # Run TypeScript type checking
```

### Testing
```bash
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once
npm run test:ui     # Run tests with Vitest UI interface
```

### Deployment
```bash
wrangler deploy     # Deploy to Cloudflare Workers
```

## TypeScript Architecture

The project uses **TypeScript with Vite** for modern development with strict type checking enabled. Key architectural components:

```
├── index.html              # Entry point with game UI
├── src/                    # TypeScript source files
│   ├── main.ts            # Main game logic and initialization
│   ├── game.ts            # Game2048 class with core game mechanics
│   ├── translations.ts    # Translation manager and i18n logic
│   ├── types.ts           # TypeScript type definitions
│   ├── style.css          # Modern CSS with animations & responsive design
│   ├── translations.json  # Internationalization data (ja/en)
│   └── worker.ts          # Cloudflare Workers handler
├── tests/                  # Vitest test files
├── tsconfig.json          # TypeScript configuration
├── vite.config.js         # Vite build configuration  
└── wrangler.toml          # Cloudflare Workers configuration
```

### Core Architecture Components

**TypeScript Configuration:**
- Strict type checking with `exactOptionalPropertyTypes`
- ES2020 target with modern DOM types
- Bundler module resolution for optimal tree-shaking

**Game Engine (`src/main.ts` + `src/game.ts`):**
- `TranslationManager` - Type-safe async JSON translation loader
- `Game2048` - Main game class with full TypeScript interfaces
- Clean separation of concerns with proper typing
- Event handling with strict type safety

**Testing Infrastructure (`tests/`):**
- Vitest for unit and integration testing
- JSDOM environment for DOM testing
- UI test runner available for interactive debugging

**Deployment (`src/worker.ts`):**
- TypeScript-first Cloudflare Workers integration
- Static asset serving with proper type definitions

## Key Technical Improvements

### Modern JavaScript Patterns
- **ES6+ Classes**: Modular Game2048 and TranslationManager classes
- **Async/Await**: Proper async loading of translations
- **Map Data Structures**: Efficient tile element management
- **Template Literals**: Clean string interpolation
- **Destructuring & Spread**: Modern array/object operations

### Performance Optimizations
- **Efficient DOM Updates**: Differential updates, no unnecessary re-rendering
- **CSS Animations**: Hardware-accelerated transitions
- **Lazy Loading**: Translation files loaded asynchronously
- **Memory Management**: Proper cleanup of tile elements

### Developer Experience
- **Vite HMR**: Hot module reloading for rapid development
- **npm Scripts**: Streamlined build and deployment commands
- **CI/CD Pipeline**: Automated testing and deployment
- **Environment Separation**: Preview and production deployments

## Game Features

### Core Mechanics
- **Multi-target Modes**: 2048, 4096, 8192, 16384+ goals
- **Achievement System**: Progressive unlocks with visual celebrations
- **Smart Game State**: Win condition detection with continue option
- **Local Persistence**: Best scores and preferences saved

### User Interface
- **Responsive Design**: Optimized for desktop and mobile
- **Touch Gestures**: Swipe controls for mobile devices
- **Keyboard Support**: Arrow keys, WASD, R/Space shortcuts
- **Visual Feedback**: Smooth animations and merge effects

### Internationalization
- **Dynamic Language Switching**: Japanese ⟷ English toggle
- **Localized Content**: All UI text and messages translated
- **Cultural Adaptation**: Appropriate messaging for each language

## Development Guidelines

### Code Organization
- **Modular Structure**: Separate concerns into logical classes/functions  
- **Async Pattern**: Use async/await for any asynchronous operations
- **Error Handling**: Graceful fallbacks for network/storage failures
- **Performance Focus**: Minimize DOM manipulation and optimize animations

### Build Process
- **Vite Bundling**: Automatic optimization and minification
- **Asset Management**: Efficient loading and caching
- **Environment Variables**: Separate dev/staging/production configs
- **Source Maps**: Debugging support in development

### Testing & Quality Assurance
```bash
npm run test         # Run Vitest in watch mode during development
npm run test:run     # Run all tests once (for CI/production verification)
npm run test:ui      # Open Vitest UI for interactive test debugging
npm run typecheck    # Run TypeScript compiler for type checking
npm run build        # Verify production build compiles without errors
npm run preview      # Test production build locally
```

**TypeScript Development:**
- Always run `npm run typecheck` before committing changes
- Use strict typing - avoid `any` types
- Define interfaces in `src/types.ts` for complex objects
- Leverage IDE TypeScript integration for real-time error checking

### Deployment Pipeline
- **Preview Environment**: Automatic deployment from `develop` branch
- **Production Environment**: Manual promotion from `main` branch  
- **Cloudflare Workers**: Global edge deployment for performance
- **GitHub Actions**: Automated build, test, and deploy workflow

## Common Development Tasks

### Adding New Features
1. Implement in `src/main.js` following existing patterns
2. Add any new UI text to `src/translations.json`
3. Test across different game modes and languages
4. Verify mobile compatibility

### Modifying Translations
1. Update `src/translations.json` with new keys/values
2. Reference keys in HTML with `data-i18n` attributes
3. Use `translationManager.getTranslation()` in JavaScript

### Styling Changes  
1. Modify `src/style.css` using existing CSS custom properties
2. Test responsive breakpoints and animations
3. Verify accessibility and color contrast

### Performance Optimization
1. Profile with browser dev tools
2. Optimize CSS animations for 60fps
3. Minimize JavaScript execution during gameplay
4. Use efficient data structures for game state

The codebase is production-ready and optimized for performance, maintainability, and user experience across all devices and languages.