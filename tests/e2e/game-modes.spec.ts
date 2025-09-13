import { test, expect } from './utils/BaseTest';
import { GAME_MODES } from './utils/test-helpers';

test.describe('2048 Game - Game Modes', () => {


  test('should have 2048 mode active by default', async ({ gamePage }) => {
    await gamePage.expectModeActive('2048');
    await gamePage.expectModeInactive('4096');
    await gamePage.expectModeInactive('8192');
  });

  test('should switch game modes correctly', async ({ gamePage }) => {
    await gamePage.selectMode('4096');
    await gamePage.expectModeActive('4096');
    await gamePage.expectModeInactive('2048');
    await expect(gamePage.tiles).toHaveCount(2);
    await expect(gamePage.score).toHaveText('0');
  });

  test('should persist game mode selection', async ({ gamePage }) => {
    await gamePage.selectMode('8192');
    
    await gamePage.page.reload();
    await gamePage.page.waitForLoadState('networkidle');
    await gamePage.waitForGameLoad();
    
    await gamePage.expectModeActive('8192');
    await gamePage.expectModeInactive('2048');
  });

  test('should have all available game modes', async ({ gamePage }) => {
    for (const mode of GAME_MODES) {
      await expect(gamePage.page.locator(`[data-target="${mode}"]`)).toBeVisible();
      await expect(gamePage.page.locator(`[data-target="${mode}"]`)).toHaveText(mode);
    }
  });

  test('should restart game when switching modes', async ({ gamePage }) => {
    await gamePage.performMoveSequence(['left', 'up']);
    await gamePage.selectMode('4096');
    await expect(gamePage.score).toHaveText('0');
    await expect(gamePage.tiles).toHaveCount(2);
  });
});