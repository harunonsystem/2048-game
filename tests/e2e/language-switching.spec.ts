import { test, expect } from '@playwright/test';

test.describe('2048 Game - Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should toggle between Japanese and English', async ({ page }) => {
    // Initially should be in Japanese
    await expect(page.locator('#flag-icon')).toHaveText('🇺🇸');
    await expect(page.locator('[data-i18n="score"]')).toHaveText('スコア');
    
    // Click to switch to English
    await page.click('#lang-toggle');
    await page.waitForTimeout(500);
    
    // Should now be in English
    await expect(page.locator('#flag-icon')).toHaveText('🇯🇵');
    await expect(page.locator('[data-i18n="score"]')).toHaveText('Score');
    
    // Click again to switch back to Japanese
    await page.click('#lang-toggle');
    await page.waitForTimeout(500);
    
    await expect(page.locator('#flag-icon')).toHaveText('🇺🇸');
    await expect(page.locator('[data-i18n="score"]')).toHaveText('スコア');
  });

  test('should persist language preference', async ({ page }) => {
    // Switch to English
    await page.click('#lang-toggle');
    await page.waitForTimeout(500);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be in English
    await expect(page.locator('#flag-icon')).toHaveText('🇯🇵');
    await expect(page.locator('[data-i18n="score"]')).toHaveText('Score');
  });

  test('should translate all UI elements correctly', async ({ page }) => {
    // Test Japanese translations
    const japaneseElements = {
      '[data-i18n="score"]': 'スコア',
      '[data-i18n="best"]': 'ベスト',
      '[data-i18n="newGame"]': '新しいゲーム',
      '[data-i18n="howToPlay"]': '遊び方：'
    };

    for (const [selector, expectedText] of Object.entries(japaneseElements)) {
      await expect(page.locator(selector)).toHaveText(expectedText);
    }

    // Switch to English
    await page.click('#lang-toggle');
    await page.waitForTimeout(500);

    // Test English translations
    const englishElements = {
      '[data-i18n="score"]': 'Score',
      '[data-i18n="best"]': 'Best',
      '[data-i18n="newGame"]': 'New Game',
      '[data-i18n="howToPlay"]': 'How to Play:'
    };

    for (const [selector, expectedText] of Object.entries(englishElements)) {
      await expect(page.locator(selector)).toHaveText(expectedText);
    }
  });
});