import { Page } from '@playwright/test';

export class TestHelpers {
  static async simulateFocusLoss(page: Page) {
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
  }

  static async simulateFocusGain(page: Page) {
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
  }

  static async setMobileViewport(page: Page) {
    await page.setViewportSize({ width: 375, height: 667 });
  }

  static async playUntilScoreChange(page: Page, maxAttempts = 20): Promise<boolean> {
    const initialScore = parseInt(await page.locator('#score').textContent() || '0');
    
    for (let i = 0; i < maxAttempts; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(200);
      
      const currentScore = parseInt(await page.locator('#score').textContent() || '0');
      if (currentScore > initialScore) {
        return true;
      }
    }
    return false;
  }

  static async performRandomMoves(page: Page, count: number) {
    const moves = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    
    for (let i = 0; i < count; i++) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      await page.keyboard.press(randomMove);
      await page.waitForTimeout(100);
    }
  }

  static async waitForAnimations(page: Page, duration = 500) {
    await page.waitForTimeout(duration);
  }

  static getTestDataAttribute(key: string): string {
    return `[data-i18n="${key}"]`;
  }

  static getModeSelector(mode: string): string {
    return `[data-target="${mode}"]`;
  }
}

export const GAME_MODES = [
  '2048', '4096', '8192', '16384', '32768', '65536', '131072', '262144', '524288'
] as const;

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  ja: {
    score: 'スコア',
    best: 'ベスト', 
    newGame: '新しいゲーム',
    howToPlay: '遊び方：'
  },
  en: {
    score: 'Score',
    best: 'Best',
    newGame: 'New Game', 
    howToPlay: 'How to Play:'
  }
};