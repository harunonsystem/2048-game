# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern 2048 puzzle game built with **Vite + npm** and deployed to **Cloudflare Workers**. Players slide numbered tiles on a 4×4 grid to combine them and reach the target tile (2048, 4096, etc). Features responsive design, touch controls, smooth animations, internationalization, and local storage persistence.

## Running the Application

### Development
```bash
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # Build for production 
npm run preview   # Preview production build
```

### Deployment
```bash
npm run deploy:preview     # Deploy to preview environment
npm run deploy:production  # Deploy to production environment
```

## Modern Architecture

The project uses a **modular Vite-based architecture** with the following structure:

```
├── index.html              # Entry point with game UI
├── src/
│   ├── main.js            # Main game logic (refactored Game2048 class)
│   ├── style.css          # Modern CSS with animations & responsive design
│   ├── translations.json  # Internationalization data (ja/en)
│   └── worker.js          # Cloudflare Workers handler
├── package.json           # npm dependencies & scripts
├── vite.config.js         # Vite build configuration  
├── wrangler.toml          # Cloudflare Workers configuration
└── .github/workflows/     # CI/CD automation
```

### Core Architecture Components

**Game Engine (`src/main.js`):**
- `TranslationManager` - Async JSON translation loader
- `Game2048` - Main game class with modular method organization
- Async initialization with proper translation loading
- Clean separation of concerns (DOM, game logic, persistence)

**Styling (`src/style.css`):**
- CSS Grid-based game board with smooth animations
- Modern gradients and visual effects for tiles
- Responsive design with mobile touch support
- Achievement-specific tile animations (golden glow, etc.)

**Internationalization (`src/translations.json`):**
- JSON-based translation system supporting Japanese/English
- Async loading with fallback support
- Extensible structure for additional languages

**Deployment (`src/worker.js`):**
- Cloudflare Workers integration with KV asset handler
- Static asset serving with SPA routing support

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

### Testing & Debugging
```bash
npm run dev      # Test with live reloading
npm run build    # Verify production build
npm run preview  # Test production build locally
```

**Manual Testing Checklist:**
1. All movement directions (arrows/WASD/touch)
2. Tile merging logic and animations  
3. Achievement unlocks and celebrations
4. Language switching functionality
5. Game mode changes and persistence
6. Mobile responsiveness and touch controls
7. Social sharing features

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