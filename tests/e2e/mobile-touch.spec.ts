import { mobileTest as test, expect } from './utils/BaseTest';

test.describe('2048 Game - Mobile Touch Controls', () => {

  test('should handle swipe gestures', async ({ gamePage }) => {
    const initialTileCount = await gamePage.getTileCount();
    await gamePage.swipeLeft();
    const newTileCount = await gamePage.getTileCount();
    expect(newTileCount).toBeGreaterThanOrEqual(initialTileCount);
    await gamePage.validateGameState();
  });

  test('should prevent default touch behavior', async ({ gamePage }) => {
    await gamePage.swipeUp();
    await gamePage.swipeDown();
    await gamePage.validateGameState();
  });

  test('should work correctly on mobile viewport', async ({ gamePage }) => {
    await expect(gamePage.title).toBeVisible();
    await expect(gamePage.score).toBeVisible();
    await expect(gamePage.bestScore).toBeVisible();
    await expect(gamePage.gameBoard).toBeVisible();
    await expect(gamePage.page.locator('.mode-selector')).toBeVisible();
    await expect(gamePage.langToggle).toBeVisible();
  });

  test('should handle touch on UI elements', async ({ gamePage }) => {
    await gamePage.restart();
    await expect(gamePage.tiles).toHaveCount(2);
    await expect(gamePage.score).toHaveText('0');
  });

  test('should handle mode switching on mobile', async ({ gamePage }) => {
    await gamePage.selectMode('4096');
    await gamePage.expectModeActive('4096');
    await expect(gamePage.tiles).toHaveCount(2);
  });
});