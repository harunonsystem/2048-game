# E2E Tests for 2048 Game

This directory contains comprehensive end-to-end tests using Playwright for the 2048 game application.

## Test Coverage

### Core Functionality Tests
- **game-basic.spec.ts**: Tests basic game initialization, UI elements, and restart functionality
- **game-controls.spec.ts**: Tests keyboard controls (arrow keys, WASD, restart keys)
- **game-mechanics.spec.ts**: Tests game mechanics like tile merging, score updates, and tile positioning
- **advanced-gameplay.spec.ts**: Tests complex scenarios like rapid inputs and state consistency

### User Interface Tests
- **language-switching.spec.ts**: Tests Japanese/English language toggle functionality
- **game-modes.spec.ts**: Tests different game mode selection (2048, 4096, 8192, etc.)
- **game-over.spec.ts**: Tests game over states and modal functionality

### Mobile & Touch Tests
- **mobile-touch.spec.ts**: Tests mobile viewport and touch gesture handling

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npm run test:e2e tests/e2e/game-basic.spec.ts
```

## Test Structure

Each test file follows this pattern:
1. **Setup**: Navigate to the game and wait for initial load
2. **Test Scenarios**: Specific functionality testing
3. **Assertions**: Verify expected behavior
4. **Cleanup**: Automatic cleanup between tests

## Browser Coverage

Tests run across three browsers:
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox) 
- **WebKit** (Desktop Safari)

## Key Test Features

- **Cross-browser compatibility** testing
- **Mobile viewport** testing
- **Keyboard interaction** testing
- **Touch gesture** simulation
- **Game state validation**
- **UI element verification**
- **Language switching** validation
- **Score persistence** testing

## Test Results

All tests are designed to be:
- ✅ Fast and reliable
- ✅ Cross-browser compatible
- ✅ Mobile-friendly
- ✅ Comprehensive in coverage