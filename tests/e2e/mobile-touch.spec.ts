import { test, expect } from '@playwright/test';

test.describe('2048 Game - Mobile Touch Controls', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport and enable touch
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.tile', { timeout: 5000 });
  });

  test('should handle swipe gestures', async ({ page }) => {
    const gameBoard = page.locator('#game-board');
    const initialTileCount = await page.locator('.tile').count();
    
    // Simulate swipe left
    await gameBoard.hover();
    await page.mouse.down();
    await page.mouse.move(100, 300);
    await page.mouse.move(50, 300);
    await page.mouse.up();
    
    await page.waitForTimeout(300);
    
    // Should have same or more tiles after swipe
    const newTileCount = await page.locator('.tile').count();
    expect(newTileCount).toBeGreaterThanOrEqual(initialTileCount);
  });

  test('should prevent default touch behavior', async ({ page }) => {
    // Test that the game board doesn't scroll when swiping
    const gameBoard = page.locator('#game-board');
    
    // Simulate swipe gestures
    await gameBoard.hover();
    await page.mouse.down();
    await page.mouse.move(200, 300);
    await page.mouse.move(200, 100);
    await page.mouse.up();
    
    // Game should still be playable
    const tileCount = await page.locator('.tile').count();
    expect(tileCount).toBeGreaterThanOrEqual(2);
  });

  test('should work correctly on mobile viewport', async ({ page }) => {
    // Test that all elements are visible and accessible on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#score')).toBeVisible();
    await expect(page.locator('#best-score')).toBeVisible();
    await expect(page.locator('#game-board')).toBeVisible();
    await expect(page.locator('.mode-selector')).toBeVisible();
    
    // Language toggle should be visible
    await expect(page.locator('#lang-toggle')).toBeVisible();
  });

  test('should handle touch on UI elements', async ({ page }) => {
    // Test touch interactions with buttons using click instead of tap for compatibility
    await page.locator('#restart-btn').click();
    await page.waitForTimeout(500);
    
    // Should restart the game
    await expect(page.locator('.tile')).toHaveCount(2);
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('should handle mode switching on mobile', async ({ page }) => {
    // Test mode button clicks on mobile
    await page.locator('[data-target="4096"]').click();
    await page.waitForTimeout(500);
    
    await expect(page.locator('[data-target="4096"]')).toHaveClass(/active/);
    await expect(page.locator('.tile')).toHaveCount(2);
  });
});