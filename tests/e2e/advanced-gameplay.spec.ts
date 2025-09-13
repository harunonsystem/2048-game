import { test, expect } from './utils/BaseTest';
import { TestHelpers } from './utils/test-helpers';

test.describe('2048 Game - Advanced Gameplay', () => {


  test('should maintain game state consistency during gameplay', async ({ gamePage }) => {
    await gamePage.performMoveSequence(['left', 'up', 'right', 'down']);
    await gamePage.validateGameState();
  });

  test('should handle rapid key presses gracefully', async ({ gamePage }) => {
    await gamePage.rapidMoves(20);
    await TestHelpers.waitForAnimations(gamePage.page, 1000);
    await gamePage.validateGameState();
  });

  test('should preserve best score across sessions', async ({ gamePage }) => {
    const initialBestScore = await gamePage.getBestScore();
    await TestHelpers.performRandomMoves(gamePage.page, 15);
    
    const currentScore = await gamePage.getScore();
    const currentBestScore = await gamePage.getBestScore();
    
    expect(currentBestScore).toBeGreaterThanOrEqual(initialBestScore);
    
    if (currentScore > initialBestScore) {
      expect(currentBestScore).toBeGreaterThanOrEqual(currentScore);
    }
    
    await gamePage.page.reload();
    await gamePage.page.waitForLoadState('networkidle');
    
    const persistedBestScore = await gamePage.getBestScore();
    expect(persistedBestScore).toBe(currentBestScore);
  });

  test('should handle browser focus/blur correctly', async ({ gamePage }) => {
    await gamePage.performMoveSequence(['left', 'up']);
    
    await TestHelpers.simulateFocusLoss(gamePage.page);
    await TestHelpers.waitForAnimations(gamePage.page);
    await TestHelpers.simulateFocusGain(gamePage.page);
    
    const initialTileCount = await gamePage.getTileCount();
    await gamePage.move('right');
    const newTileCount = await gamePage.getTileCount();
    expect(newTileCount).toBeGreaterThanOrEqual(initialTileCount);
  });

  test('should validate tile positioning and animations', async ({ gamePage }) => {
    await gamePage.move('left');
    await TestHelpers.waitForAnimations(gamePage.page);
    await gamePage.validateTilePositions();
  });
});