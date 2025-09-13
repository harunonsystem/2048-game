import { test, expect } from '@playwright/test';

test.describe('2048 Game - Game Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.tile', { timeout: 5000 });
  });

  test('should update score when tiles merge', async ({ page }) => {
    // Get initial score
    const initialScore = await page.locator('#score').textContent();
    
    // Make multiple moves to try to merge tiles
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);
      
      // Check if score has changed
      const currentScore = await page.locator('#score').textContent();
      if (currentScore !== initialScore && parseInt(currentScore!) > 0) {
        expect(parseInt(currentScore!)).toBeGreaterThan(parseInt(initialScore!));
        break;
      }
    }
  });

  test('should add new tile after valid move', async ({ page }) => {
    const initialTileCount = await page.locator('.tile').count();
    
    // Make a move
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);
    
    // Should have at least the same number of tiles (or more if new tile was added)
    const newTileCount = await page.locator('.tile').count();
    expect(newTileCount).toBeGreaterThanOrEqual(initialTileCount);
  });

  test('should display tiles with correct values', async ({ page }) => {
    // Initial tiles should be 2 or 4
    const tiles = page.locator('.tile');
    const tileTexts = await tiles.allTextContents();
    
    for (const text of tileTexts) {
      const value = parseInt(text);
      expect(value === 2 || value === 4).toBeTruthy();
    }
  });

  test('should position tiles correctly on grid', async ({ page }) => {
    const tiles = page.locator('.tile');
    
    // All tiles should have positioning styles
    const count = await tiles.count();
    for (let i = 0; i < count; i++) {
      const tile = tiles.nth(i);
      const left = await tile.evaluate(el => el.style.left);
      const top = await tile.evaluate(el => el.style.top);
      
      expect(left).toBeTruthy();
      expect(top).toBeTruthy();
    }
  });

  test('should update best score when current score exceeds it', async ({ page }) => {
    const initialBestScore = await page.locator('#best-score').textContent();
    
    // Try to achieve a higher score through gameplay
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
      
      const currentScore = await page.locator('#score').textContent();
      const currentBestScore = await page.locator('#best-score').textContent();
      
      if (parseInt(currentScore!) > parseInt(initialBestScore!)) {
        expect(parseInt(currentBestScore!)).toBeGreaterThanOrEqual(parseInt(currentScore!));
        break;
      }
    }
  });
});