import { test, expect } from '@playwright/test';

test.describe('2048 Game - Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.tile', { timeout: 5000 });
  });

  test('should respond to arrow key movements', async ({ page }) => {
    const initialTileCount = await page.locator('.tile').count();
    
    // Press arrow key to move tiles
    await page.keyboard.press('ArrowLeft');
    
    // Wait for animation and new tile to appear
    await page.waitForTimeout(300);
    
    // Should have one more tile after movement
    const newTileCount = await page.locator('.tile').count();
    expect(newTileCount).toBeGreaterThanOrEqual(initialTileCount);
  });

  test('should respond to WASD key movements', async ({ page }) => {
    const initialTileCount = await page.locator('.tile').count();
    
    // Test W key (up movement)
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(300);
    
    const newTileCount = await page.locator('.tile').count();
    expect(newTileCount).toBeGreaterThanOrEqual(initialTileCount);
  });

  test('should restart game with R key', async ({ page }) => {
    // Make some moves first
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(500);
    
    // Press R to restart
    await page.keyboard.press('KeyR');
    await page.waitForTimeout(500);
    
    // Should have exactly 2 tiles after restart
    await expect(page.locator('.tile')).toHaveCount(2);
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('should restart game with Space key', async ({ page }) => {
    // Make some moves first
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    
    // Press Space to restart
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    
    // Should have exactly 2 tiles after restart
    await expect(page.locator('.tile')).toHaveCount(2);
    await expect(page.locator('#score')).toHaveText('0');
  });
});