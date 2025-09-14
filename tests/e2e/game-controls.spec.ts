import { test, expect } from './utils/BaseTest';

test.describe('2048 Game - Controls', () => {

  test('should respond to arrow key movements', async ({ gamePage }) => {
    const initialTileCount = await gamePage.getTileCount();
    await gamePage.move('left');
    const newTileCount = await gamePage.getTileCount();
    expect(newTileCount).toBeGreaterThanOrEqual(initialTileCount);
    await gamePage.validateGameState();
  });

  test('should respond to WASD key movements', async ({ gamePage }) => {
    const initialTileCount = await gamePage.getTileCount();
    await gamePage.moveWASD('w');
    const newTileCount = await gamePage.getTileCount();
    expect(newTileCount).toBeGreaterThanOrEqual(initialTileCount);
    await gamePage.validateGameState();
  });

  test('should restart game with R key', async ({ gamePage }) => {
    await gamePage.performMoveSequence(['left', 'up']);
    await gamePage.page.keyboard.press('KeyR');
    await gamePage.page.waitForTimeout(500);
    await expect(gamePage.tiles).toHaveCount(2);
    await expect(gamePage.score).toHaveText('0');
  });

  test('should restart game with Space key', async ({ gamePage }) => {
    await gamePage.performMoveSequence(['right', 'down']);
    await gamePage.page.keyboard.press('Space');
    await gamePage.page.waitForTimeout(500);
    await expect(gamePage.tiles).toHaveCount(2);
    await expect(gamePage.score).toHaveText('0');
  });
});