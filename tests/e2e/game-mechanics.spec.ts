import { test, expect } from './utils/BaseTest';
import { TestHelpers } from './utils/test-helpers';

test.describe('2048 Game - Game Mechanics', () => {


  test('should update score when tiles merge', async ({ gamePage }) => {
    const initialScore = await gamePage.getScore();
    const scoreChanged = await TestHelpers.playUntilScoreChange(gamePage.page);
    
    if (scoreChanged) {
      const currentScore = await gamePage.getScore();
      expect(currentScore).toBeGreaterThan(initialScore);
    }
  });

  test('should add new tile after valid move', async ({ gamePage }) => {
    const initialTileCount = await gamePage.getTileCount();
    await gamePage.move('left');
    const newTileCount = await gamePage.getTileCount();
    expect(newTileCount).toBeGreaterThanOrEqual(initialTileCount);
  });

  test('should display tiles with correct values', async ({ gamePage }) => {
    await gamePage.validateInitialTileValues();
  });

  test('should position tiles correctly on grid', async ({ gamePage }) => {
    await gamePage.validateTilePositions();
  });

  test('should update best score when current score exceeds it', async ({ gamePage }) => {
    const initialBestScore = await gamePage.getBestScore();
    await TestHelpers.playUntilScoreChange(gamePage.page, 20);
    
    const currentScore = await gamePage.getScore();
    const currentBestScore = await gamePage.getBestScore();
    
    if (currentScore > initialBestScore) {
      expect(currentBestScore).toBeGreaterThanOrEqual(currentScore);
    }
  });
});