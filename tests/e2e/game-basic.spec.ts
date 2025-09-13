import { test, expect } from '@playwright/test';

test.describe('2048 Game - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the game with initial state', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('2048');
    await expect(page.locator('#score')).toHaveText('0');
    await expect(page.locator('#best-score')).toBeVisible();
    
    // Should have 16 grid cells
    await expect(page.locator('.grid-cell')).toHaveCount(16);
    
    // Should have 2 initial tiles
    await page.waitForSelector('.tile', { timeout: 5000 });
    const tiles = page.locator('.tile');
    await expect(tiles).toHaveCount(2);
  });

  test('should display game instructions', async ({ page }) => {
    await expect(page.locator('[data-i18n="howToPlay"]')).toBeVisible();
    await expect(page.locator('[data-i18n="instructions"]')).toBeVisible();
  });

  test('should have mode selector buttons', async ({ page }) => {
    const modeButtons = page.locator('.mode-button');
    await expect(modeButtons).toHaveCount(9);
    
    // 2048 mode should be active by default
    await expect(page.locator('[data-target="2048"]')).toHaveClass(/active/);
  });

  test('should start a new game when restart button is clicked', async ({ page }) => {
    await page.click('#restart-btn');
    
    // Should still have 2 tiles after restart
    await page.waitForSelector('.tile', { timeout: 5000 });
    const tiles = page.locator('.tile');
    await expect(tiles).toHaveCount(2);
    
    // Score should be reset to 0
    await expect(page.locator('#score')).toHaveText('0');
  });
});