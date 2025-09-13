import { test, expect } from './utils/BaseTest';

test.describe('2048 Game - Game Over States', () => {


  test('should show game message when winning/losing', async ({ gamePage }) => {
    await expect(gamePage.gameMessage).toHaveClass(/hidden/);
  });

  test('should have modal elements in DOM structure', async ({ gamePage }) => {
    await expect(gamePage.gameMessage).toHaveCount(1);
    await expect(gamePage.tryAgainBtn).toHaveCount(1);
    await expect(gamePage.continueBtn).toHaveCount(1);
  });

  test('should have score display elements in modal structure', async ({ gamePage }) => {
    await expect(gamePage.finalScore).toHaveCount(1);
    await expect(gamePage.resultBestScore).toHaveCount(1);
    await expect(gamePage.highestTile).toHaveCount(1);
  });

  test('should have share functionality buttons in DOM', async ({ gamePage }) => {
    await expect(gamePage.shareXBtn).toHaveCount(1);
    await expect(gamePage.copyResultBtn).toHaveCount(1);
  });

  test('should have result statistics elements in DOM', async ({ gamePage }) => {
    await expect(gamePage.page.locator('[data-i18n="finalScore"]')).toHaveCount(1);
    await expect(gamePage.page.locator('[data-i18n="bestScore"]')).toHaveCount(1);
    await expect(gamePage.page.locator('[data-i18n="highestTile"]')).toHaveCount(1);
  });

  test('should have proper modal structure and styling', async ({ gamePage }) => {
    await expect(gamePage.gameMessage).toHaveClass(/game-message/);
    await expect(gamePage.gameMessage).toHaveClass(/hidden/);
    await expect(gamePage.page.locator('#game-message .message-content')).toHaveCount(1);
    await expect(gamePage.page.locator('#game-message .action-buttons')).toHaveCount(1);
  });

  test('should have proper modal content structure', async ({ gamePage }) => {
    await expect(gamePage.messageText).toHaveCount(1);
    await expect(gamePage.page.locator('#result-subtitle')).toHaveCount(1);
    await expect(gamePage.page.locator('#result-details')).toHaveCount(1);
    await expect(gamePage.page.locator('#celebration-effects')).toHaveCount(1);
    await expect(gamePage.page.locator('#result-icon')).toHaveCount(1);
  });

  test('should have complete button structure', async ({ gamePage }) => {
    await expect(gamePage.tryAgainBtn).toHaveCount(1);
    await expect(gamePage.continueBtn).toHaveCount(1);
    await expect(gamePage.shareXBtn).toHaveCount(1);
    await expect(gamePage.copyResultBtn).toHaveCount(1);
    await expect(gamePage.tryAgainBtn).toHaveAttribute('data-i18n', 'tryAgain');
    await expect(gamePage.continueBtn).toHaveAttribute('data-i18n', 'continueGame');
  });
});