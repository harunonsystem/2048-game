import { test, expect } from '@playwright/test';

test.describe('2048 Game - Game Modes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.tile', { timeout: 5000 });
  });

  test('should have 2048 mode active by default', async ({ page }) => {
    await expect(page.locator('[data-target="2048"]')).toHaveClass(/active/);
    
    // Other modes should not be active
    await expect(page.locator('[data-target="4096"]')).not.toHaveClass(/active/);
    await expect(page.locator('[data-target="8192"]')).not.toHaveClass(/active/);
  });

  test('should switch game modes correctly', async ({ page }) => {
    // Switch to 4096 mode
    await page.click('[data-target="4096"]');
    await page.waitForTimeout(500);
    
    await expect(page.locator('[data-target="4096"]')).toHaveClass(/active/);
    await expect(page.locator('[data-target="2048"]')).not.toHaveClass(/active/);
    
    // Game should restart with 2 tiles
    await expect(page.locator('.tile')).toHaveCount(2);
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('should persist game mode selection', async ({ page }) => {
    // Switch to 8192 mode
    await page.click('[data-target="8192"]');
    await page.waitForTimeout(500);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.tile', { timeout: 5000 });
    
    // Should still be in 8192 mode
    await expect(page.locator('[data-target="8192"]')).toHaveClass(/active/);
    await expect(page.locator('[data-target="2048"]')).not.toHaveClass(/active/);
  });

  test('should have all available game modes', async ({ page }) => {
    const expectedModes = ['2048', '4096', '8192', '16384', '32768', '65536', '131072', '262144', '524288'];
    
    for (const mode of expectedModes) {
      await expect(page.locator(`[data-target="${mode}"]`)).toBeVisible();
      await expect(page.locator(`[data-target="${mode}"]`)).toHaveText(mode);
    }
  });

  test('should restart game when switching modes', async ({ page }) => {
    // Make some moves to increase score
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(500);
    
    // Switch mode
    await page.click('[data-target="4096"]');
    await page.waitForTimeout(500);
    
    // Score should be reset to 0
    await expect(page.locator('#score')).toHaveText('0');
    
    // Should have exactly 2 tiles
    await expect(page.locator('.tile')).toHaveCount(2);
  });
});