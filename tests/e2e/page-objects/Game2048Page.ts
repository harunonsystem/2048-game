import { Page, Locator, expect } from '@playwright/test';

export class Game2048Page {
  readonly page: Page;
  
  // Main game elements
  readonly title: Locator;
  readonly score: Locator;
  readonly bestScore: Locator;
  readonly gameBoard: Locator;
  readonly tiles: Locator;
  readonly gridCells: Locator;
  readonly restartBtn: Locator;
  
  // Language elements
  readonly langToggle: Locator;
  readonly flagIcon: Locator;
  
  // Mode selector elements
  readonly modeButtons: Locator;
  
  // Game message modal elements
  readonly gameMessage: Locator;
  readonly messageText: Locator;
  readonly tryAgainBtn: Locator;
  readonly continueBtn: Locator;
  readonly finalScore: Locator;
  readonly resultBestScore: Locator;
  readonly highestTile: Locator;
  readonly shareXBtn: Locator;
  readonly copyResultBtn: Locator;
  
  // Footer elements
  readonly footerLinks: Locator;
  readonly contactLink: Locator;
  readonly sponsorLink: Locator;
  readonly coffeeLink: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Main game elements
    this.title = page.locator('h1');
    this.score = page.locator('#score');
    this.bestScore = page.locator('#best-score');
    this.gameBoard = page.locator('#game-board');
    this.tiles = page.locator('.tile');
    this.gridCells = page.locator('.grid-cell');
    this.restartBtn = page.locator('#restart-btn');
    
    // Language elements
    this.langToggle = page.locator('#lang-toggle');
    this.flagIcon = page.locator('#flag-icon');
    
    // Mode selector elements
    this.modeButtons = page.locator('.mode-button');
    
    // Game message modal elements
    this.gameMessage = page.locator('#game-message');
    this.messageText = page.locator('#message-text');
    this.tryAgainBtn = page.locator('#try-again-btn');
    this.continueBtn = page.locator('#continue-btn');
    this.finalScore = page.locator('#final-score');
    this.resultBestScore = page.locator('#result-best-score');
    this.highestTile = page.locator('#highest-tile');
    this.shareXBtn = page.locator('#share-x-btn');
    this.copyResultBtn = page.locator('#copy-result-btn');
    
    // Footer elements
    this.footerLinks = page.locator('.footer-links');
    this.contactLink = page.locator('.contact-link');
    this.sponsorLink = page.locator('.github-sponsor-link');
    this.coffeeLink = page.locator('.coffee-link');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    await this.waitForGameLoad();
  }

  private async hideDebugPanel() {
    await this.page.evaluate(() => {
      const debugPanel = document.getElementById('debug-panel');
      if (debugPanel) {
        debugPanel.style.display = 'none';
      }
    });
  }

  async waitForGameLoad() {
    await this.tiles.first().waitFor({ timeout: 5000 });
  }

  async restart() {
    await this.hideDebugPanel();
    await this.restartBtn.click();
    await this.waitForGameLoad();
  }

  async move(direction: 'left' | 'right' | 'up' | 'down') {
    const keyMap = {
      left: 'ArrowLeft',
      right: 'ArrowRight', 
      up: 'ArrowUp',
      down: 'ArrowDown'
    };
    await this.page.keyboard.press(keyMap[direction]);
    await this.page.waitForTimeout(300); // Wait for animation
  }

  async moveWASD(direction: 'w' | 'a' | 's' | 'd') {
    const keyMap = {
      w: 'KeyW',
      a: 'KeyA',
      s: 'KeyS', 
      d: 'KeyD'
    };
    await this.page.keyboard.press(keyMap[direction]);
    await this.page.waitForTimeout(300);
  }

  async rapidMoves(count: number) {
    const moves = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    for (let i = 0; i < count; i++) {
      const move = moves[i % moves.length];
      await this.page.keyboard.press(move);
      await this.page.waitForTimeout(100);
    }
  }

  async performMoveSequence(moves: Array<'left' | 'right' | 'up' | 'down'>) {
    for (const move of moves) {
      await this.move(move);
    }
  }

  async getTileCount(): Promise<number> {
    return await this.tiles.count();
  }

  async getScore(): Promise<number> {
    const scoreText = await this.score.textContent();
    return parseInt(scoreText || '0');
  }

  async getBestScore(): Promise<number> {
    const bestScoreText = await this.bestScore.textContent();
    return parseInt(bestScoreText || '0');
  }

  async getTileValues(): Promise<number[]> {
    const tileTexts = await this.tiles.allTextContents();
    return tileTexts.map(text => parseInt(text));
  }

  async selectMode(mode: string) {
    await this.hideDebugPanel();
    await this.page.locator(`[data-target="${mode}"]`).click();
    await this.page.waitForTimeout(500);
  }

  async toggleLanguage() {
    await this.hideDebugPanel();
    await this.langToggle.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  private async performSwipe(direction: 'left' | 'right' | 'up' | 'down') {
    const boardBox = await this.gameBoard.boundingBox();
    if (!boardBox) throw new Error('Game board not found');
    
    const { startX, startY, endX, endY } = this.getSwipeCoordinates(boardBox, direction);
    
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY);
    await this.page.mouse.up();
    await this.page.waitForTimeout(300);
  }

  private getSwipeCoordinates(box: { x: number; y: number; width: number; height: number }, direction: string) {
    const centerX = box.x + box.width * 0.5;
    const centerY = box.y + box.height * 0.5;
    
    switch (direction) {
      case 'left':
        return {
          startX: box.x + box.width * 0.8,
          startY: centerY,
          endX: box.x + box.width * 0.2,
          endY: centerY
        };
      case 'right':
        return {
          startX: box.x + box.width * 0.2,
          startY: centerY,
          endX: box.x + box.width * 0.8,
          endY: centerY
        };
      case 'up':
        return {
          startX: centerX,
          startY: box.y + box.height * 0.8,
          endX: centerX,
          endY: box.y + box.height * 0.2
        };
      case 'down':
        return {
          startX: centerX,
          startY: box.y + box.height * 0.2,
          endX: centerX,
          endY: box.y + box.height * 0.8
        };
      default:
        throw new Error(`Invalid swipe direction: ${direction}`);
    }
  }

  async swipeLeft() {
    await this.performSwipe('left');
  }

  async swipeRight() {
    await this.performSwipe('right');
  }

  async swipeUp() {
    await this.performSwipe('up');
  }

  async swipeDown() {
    await this.performSwipe('down');
  }

  // Validation helpers
  async validateGameState() {
    const tileCount = await this.getTileCount();
    const score = await this.getScore();
    
    expect(tileCount).toBeGreaterThanOrEqual(2);
    expect(tileCount).toBeLessThanOrEqual(16);
    expect(score).toBeGreaterThanOrEqual(0);
  }

  async validateTilePositions() {
    const count = await this.tiles.count();
    
    for (let i = 0; i < count; i++) {
      const tile = this.tiles.nth(i);
      const left = await tile.evaluate(el => (el as HTMLElement).style.left);
      const top = await tile.evaluate(el => (el as HTMLElement).style.top);
      
      expect(left).toBeTruthy();
      expect(top).toBeTruthy();
      expect(left).toMatch(/^\d+(\.\d+)?%$/);
      expect(top).toMatch(/^\d+(\.\d+)?%$/);
    }
  }

  async validateInitialTileValues() {
    const values = await this.getTileValues();
    
    for (const value of values) {
      expect(value === 2 || value === 4).toBeTruthy();
    }
  }

  // Language assertions
  async expectLanguage(lang: 'ja' | 'en') {
    if (lang === 'ja') {
      await expect(this.flagIcon).toHaveText('🇺🇸');
      await expect(this.page.locator('[data-i18n="score"]')).toHaveText('スコア');
    } else {
      await expect(this.flagIcon).toHaveText('🇯🇵');
      await expect(this.page.locator('[data-i18n="score"]')).toHaveText('Score');
    }
  }

  // Mode assertions  
  async expectModeActive(mode: string) {
    await expect(this.page.locator(`[data-target="${mode}"]`)).toHaveClass(/active/);
  }

  async expectModeInactive(mode: string) {
    await expect(this.page.locator(`[data-target="${mode}"]`)).not.toHaveClass(/active/);
  }
}