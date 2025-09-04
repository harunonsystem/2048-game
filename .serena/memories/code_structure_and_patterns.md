# Code Structure and Patterns

## File Structure
```
/
├── index.html          # Main HTML file with game UI
├── style.css          # All CSS styling and animations
├── script.js          # Game logic in Game2048 class
└── README.md          # Documentation in Japanese
```

## JavaScript Architecture
The game uses a single `Game2048` class with the following key methods:

### Core Game Logic
- `constructor()` - Initializes game state (grid, score, elements)
- `init()` - Sets up new game and adds initial tiles
- `move(direction)` - Main movement logic dispatcher
- `slideArray(arr)` - Core algorithm for sliding and merging tiles
- `addRandomTile()` - Adds new 2 or 4 tile to random empty cell

### Movement Methods
- `moveLeft()`, `moveRight()`, `moveUp()`, `moveDown()` - Direction-specific logic

### Game State Management
- `checkGameState()` - Checks for win/lose conditions
- `isGameOver()` - Determines if no moves are possible
- `updateScore(value)` - Updates current and best scores
- `saveBestScore()`, `loadBestScore()` - Local storage persistence

### UI Management
- `updateDisplay()` - Renders current game state to DOM
- `createTile(value, row, col)` - Creates tile elements
- `showMessage(text)`, `hideMessage()` - Win/lose message display
- `setupEventListeners()` - Keyboard and touch event handlers

## CSS Organization
- Global reset and body styling
- Container and layout styling (flexbox/grid)
- Game board grid system (4x4)
- Tile styling with value-specific colors
- Responsive design with media queries
- Animation effects for tile movements

## Data Structure
- `grid`: 4x4 2D array representing game board
- `score`: Current game score
- `bestScore`: Highest score (persisted)
- Tiles positioned using CSS Grid coordinates