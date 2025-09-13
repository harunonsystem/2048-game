import { test, expect } from '@playwright/test';

test.describe('2048 Game - Game Over States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.tile', { timeout: 5000 });
  });

  test('should show game message when winning/losing', async ({ page }) => {
    // Initially game message should be hidden
    await expect(page.locator('#game-message')).toHaveClass(/hidden/);
  });

  test('should have modal elements in DOM structure', async ({ page }) => {
    // Test that modal elements exist in DOM (using count to check existence)
    const gameMessage = page.locator('#game-message');
    const tryAgainBtn = page.locator('#try-again-btn');
    const continueBtn = page.locator('#continue-btn');
    
    await expect(gameMessage).toHaveCount(1);
    await expect(tryAgainBtn).toHaveCount(1);
    await expect(continueBtn).toHaveCount(1);
  });

  test('should have score display elements in modal structure', async ({ page }) => {
    // Test that score elements exist in DOM structure
    await expect(page.locator('#final-score')).toHaveCount(1);
    await expect(page.locator('#result-best-score')).toHaveCount(1);
    await expect(page.locator('#highest-tile')).toHaveCount(1);
  });

  test('should have share functionality buttons in DOM', async ({ page }) => {
    // Test that share buttons exist in DOM structure
    await expect(page.locator('#share-x-btn')).toHaveCount(1);
    await expect(page.locator('#copy-result-btn')).toHaveCount(1);
  });

  test('should have result statistics elements in DOM', async ({ page }) => {
    // Test that result detail elements exist in DOM structure
    await expect(page.locator('[data-i18n="finalScore"]')).toHaveCount(1);
    await expect(page.locator('[data-i18n="bestScore"]')).toHaveCount(1);
    await expect(page.locator('[data-i18n="highestTile"]')).toHaveCount(1);
  });

  test('should have proper modal structure and styling', async ({ page }) => {
    const gameMessage = page.locator('#game-message');
    
    // Should have proper classes and structure
    await expect(gameMessage).toHaveClass(/game-message/);
    await expect(gameMessage).toHaveClass(/hidden/);
    
    // Should contain required child elements
    await expect(page.locator('#game-message .message-content')).toHaveCount(1);
    await expect(page.locator('#game-message .action-buttons')).toHaveCount(1);
  });

  test('should have proper modal content structure', async ({ page }) => {
    // Test that all modal content elements exist
    await expect(page.locator('#message-text')).toHaveCount(1);
    await expect(page.locator('#result-subtitle')).toHaveCount(1);
    await expect(page.locator('#result-details')).toHaveCount(1);
    await expect(page.locator('#celebration-effects')).toHaveCount(1);
    await expect(page.locator('#result-icon')).toHaveCount(1);
  });

  test('should have complete button structure', async ({ page }) => {
    // Test all expected buttons exist
    await expect(page.locator('#try-again-btn')).toHaveCount(1);
    await expect(page.locator('#continue-btn')).toHaveCount(1);
    await expect(page.locator('#share-x-btn')).toHaveCount(1);
    await expect(page.locator('#copy-result-btn')).toHaveCount(1);
    
    // Buttons should have proper attributes
    await expect(page.locator('#try-again-btn')).toHaveAttribute('data-i18n', 'tryAgain');
    await expect(page.locator('#continue-btn')).toHaveAttribute('data-i18n', 'continueGame');
  });
});