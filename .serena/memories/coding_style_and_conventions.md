# Coding Style and Conventions

## JavaScript Style
- **ES6+ Class syntax** for main game object
- **camelCase** for method and variable names
- **PascalCase** for class names (Game2048)
- **Arrow functions** for event handlers and callbacks
- **Template literals** for string interpolation
- **const/let** instead of var
- **Semi-colon usage** - consistently used

## Naming Conventions
- Methods are descriptive: `addRandomTile()`, `checkGameState()`, `setupEventListeners()`
- DOM element IDs use kebab-case: `game-board`, `tile-container`, `restart-btn`
- CSS classes use kebab-case: `.game-board`, `.tile-container`, `.score-box`
- Grid coordinates use standard row/col terminology

## Code Organization
- Single class contains all game logic
- Methods grouped logically (movement, UI, state management)
- Event listeners set up in dedicated method
- Local storage operations encapsulated in save/load methods
- Constants embedded in methods (could be extracted for better maintainability)

## HTML Structure
- Semantic HTML5 elements
- Grid cells pre-generated in HTML (16 divs)
- Tiles dynamically created in JavaScript
- Japanese language support (`lang="ja"`)
- Accessibility considerations with semantic structure

## CSS Patterns
- Modern CSS features: Grid Layout, Flexbox, custom properties
- BEM-like naming but not strict BEM methodology
- Responsive design with mobile-first approach
- Animation effects using CSS transitions
- Modern visual effects (backdrop-filter, gradients)

## Documentation
- README in Japanese with comprehensive game description
- Inline comments minimal but descriptive
- Method names are self-documenting