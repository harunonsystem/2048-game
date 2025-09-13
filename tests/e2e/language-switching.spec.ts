import { test, expect } from './utils/BaseTest';
import { TRANSLATIONS } from './utils/test-helpers';

test.describe('2048 Game - Language Switching', () => {


  test('should toggle between Japanese and English', async ({ gamePage }) => {
    await gamePage.expectLanguage('ja');
    await gamePage.toggleLanguage();
    await gamePage.expectLanguage('en');
    await gamePage.toggleLanguage();
    await gamePage.expectLanguage('ja');
  });

  test('should persist language preference', async ({ gamePage }) => {
    await gamePage.toggleLanguage();
    await gamePage.expectLanguage('en');
    
    await gamePage.page.reload();
    await gamePage.page.waitForLoadState('networkidle');
    await gamePage.expectLanguage('en');
  });

  test('should translate all UI elements correctly', async ({ gamePage }) => {
    for (const [key, value] of Object.entries(TRANSLATIONS.ja)) {
      await expect(gamePage.page.locator(`[data-i18n="${key}"]`)).toHaveText(value);
    }

    await gamePage.toggleLanguage();

    for (const [key, value] of Object.entries(TRANSLATIONS.en)) {
      await expect(gamePage.page.locator(`[data-i18n="${key}"]`)).toHaveText(value);
    }
  });
});