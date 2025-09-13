import { test, expect } from '@playwright/test';

test.describe('2048 Game - Advanced Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.tile', { timeout: 5000 });
  });

  test('should maintain game state consistency during gameplay', async ({ page }) => {
    // Perform a sequence of moves
    const moves = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
    
    for (const move of moves) {
      await page.keyboard.press(move);
      await page.waitForTimeout(300);
      
      // Verify game state after each move
      const tileCount = await page.locator('.tile').count();
      const score = parseInt(await page.locator('#score').textContent() || '0');
      
      // Should have reasonable number of tiles (between 2-16)
      expect(tileCount).toBeGreaterThanOrEqual(2);
      expect(tileCount).toBeLessThanOrEqual(16);
      
      // Score should be non-negative
      expect(score).toBeGreaterThanOrEqual(0);
    }
  });

  test('should handle rapid key presses gracefully', async ({ page }) => {
    // Send rapid key presses
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
    }
    
    // Wait for animations to settle
    await page.waitForTimeout(1000);
    
    // Game should still be in valid state
    const finalTileCount = await page.locator('.tile').count();
    expect(finalTileCount).toBeGreaterThanOrEqual(2);
    expect(finalTileCount).toBeLessThanOrEqual(16);
    
    // Score should be valid
    const score = parseInt(await page.locator('#score').textContent() || '0');
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test('should preserve best score across sessions', async ({ page }) => {
    // Get current best score
    const initialBestScore = parseInt(await page.locator('#best-score').textContent() || '0');
    
    // Play some moves to potentially increase score
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);
    }
    
    const currentScore = parseInt(await page.locator('#score').textContent() || '0');
    const currentBestScore = parseInt(await page.locator('#best-score').textContent() || '0');
    
    // Best score should be at least the initial best score
    expect(currentBestScore).toBeGreaterThanOrEqual(initialBestScore);
    
    // If current score is higher than initial best, best should be updated
    if (currentScore > initialBestScore) {
      expect(currentBestScore).toBeGreaterThanOrEqual(currentScore);
    }
    
    // Refresh page and check persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const persistedBestScore = parseInt(await page.locator('#best-score').textContent() || '0');
    expect(persistedBestScore).toBe(currentBestScore);
  });

  test('should handle browser focus/blur correctly', async ({ page }) => {
    // Make some moves
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    
    // Simulate losing focus
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    
    // Wait a bit
    await page.waitForTimeout(500);
    
    // Simulate regaining focus
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    
    // Game should still respond to keyboard input
    const initialTileCount = await page.locator('.tile').count();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    
    const newTileCount = await page.locator('.tile').count();
    expect(newTileCount).toBeGreaterThanOrEqual(initialTileCount);
  });

  test('should validate tile positioning and animations', async ({ page }) => {
    // Make a move
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500); // Wait for animation
    
    // Verify tiles have valid positions
    const tiles = page.locator('.tile');
    const count = await tiles.count();
    
    for (let i = 0; i < count; i++) {
      const tile = tiles.nth(i);
      const left = await tile.evaluate(el => el.style.left);
      const top = await tile.evaluate(el => el.style.top);
      
      // Positions should be valid percentages
      expect(left).toMatch(/^\d+(\.\d+)?%$/);
      expect(top).toMatch(/^\d+(\.\d+)?%$/);
    }
  });
});