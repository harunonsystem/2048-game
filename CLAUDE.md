# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 2048 puzzle game implemented using vanilla HTML5, CSS3, and JavaScript. It's a client-side web application where players slide numbered tiles on a 4×4 grid to combine them and reach the 2048 tile. The game features responsive design, touch controls, smooth animations, and local storage for score persistence.

## Running the Application

Since this is a static web application, simply open `index.html` in a web browser:

```bash
open index.html  # macOS
```

For development with live reloading, use a local server:
```bash
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Architecture

The codebase follows a simple three-file structure:
- **index.html**: Game UI with score display and 4×4 grid
- **style.css**: Modern styling with CSS Grid, gradients, and animations  
- **script.js**: Single `Game2048` class containing all game logic

### Core Game Class Structure

The `Game2048` class is organized into logical method groups:

**Game State Management:**
- `constructor()` - Initialize grid (4×4 array), score, DOM elements
- `init()` - Set up new game, add two starting tiles
- `restart()` - Reset game state and UI
- `checkGameState()` - Detect win/lose conditions

**Movement System:**
- `move(direction)` - Main dispatcher for all movements
- `moveLeft()`, `moveRight()`, `moveUp()`, `moveDown()` - Direction-specific logic
- `slideArray(arr)` - Core algorithm that slides and merges tiles in a 1D array

**Tile Management:**
- `addRandomTile()` - Places new 2 or 4 tile in random empty cell
- `createTile(value, row, col)` - Creates DOM element for tile
- `updateDisplay()` - Renders current grid state to DOM

**Persistence:**
- `saveBestScore()`, `loadBestScore()` - Local storage operations

## Key Technical Patterns

- **Grid Representation**: Game state stored as 4×4 2D JavaScript array, with DOM tiles positioned using CSS Grid
- **Movement Algorithm**: Each direction converts 2D grid to 1D arrays, applies slide/merge logic, then converts back
- **Animation**: CSS transitions handle tile movements; JavaScript manages timing
- **Event Handling**: Supports keyboard (arrows, WASD, R/Space) and touch (swipe gestures)

## Development Guidelines

- **No Build Process**: Pure vanilla web technologies, no bundling or compilation
- **Manual Testing Required**: No automated test framework - test in multiple browsers and devices
- **Language**: UI text and comments are in Japanese
- **Responsive Design**: Uses CSS Grid and Flexbox for mobile/desktop compatibility

## Common Tasks

**Testing Changes:**
1. Open `index.html` in browser
2. Test all movement directions
3. Verify tile merging logic
4. Check win/lose conditions  
5. Test restart functionality
6. Verify score persistence
7. Test mobile touch controls

**Debugging:**
- Check browser console for JavaScript errors
- Inspect grid state vs DOM representation
- Monitor local storage operations

The game is complete and functional - focus changes on bug fixes, UI improvements, or performance optimizations rather than architectural modifications.