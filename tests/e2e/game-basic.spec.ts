import { test, expect } from './utils/BaseTest';
import { GAME_MODES } from './utils/test-helpers';

test.describe('2048 Game - Basic Functionality', () => {

  test('should load the game with initial state', async ({ gamePage }) => {
    await expect(gamePage.title).toHaveText('2048');
    await expect(gamePage.score).toHaveText('0');
    await expect(gamePage.bestScore).toBeVisible();
    await expect(gamePage.gridCells).toHaveCount(16);
    await expect(gamePage.tiles).toHaveCount(2);
    await gamePage.validateInitialTileValues();
  });

  test('should display game instructions', async ({ gamePage }) => {
    await expect(gamePage.page.locator('[data-i18n="howToPlay"]')).toBeVisible();
    await expect(gamePage.page.locator('[data-i18n="instructions"]')).toBeVisible();
  });

  test('should have mode selector buttons', async ({ gamePage }) => {
    await expect(gamePage.modeButtons).toHaveCount(GAME_MODES.length);
    await gamePage.expectModeActive('2048');
  });

  test('should start a new game when restart button is clicked', async ({ gamePage }) => {
    await gamePage.restart();
    await expect(gamePage.tiles).toHaveCount(2);
    await expect(gamePage.score).toHaveText('0');
    await gamePage.validateGameState();
  });
});