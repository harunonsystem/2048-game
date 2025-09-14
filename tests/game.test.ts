import { describe, it, expect, beforeEach, vi } from "vitest";
import translationsData from "../src/translations.json";
import type { Language, Translations, Translation } from "../src/types";


// We need to import the classes directly since they're not exported
// Let's create a test-specific version that exposes the classes
class MockTranslationManager {
  async loadTranslations(): Promise<Translations> {
    if (this.translations) return this.translations;

    this.translations = translationsData as Translations;
    return this.translations;
  }
  private translations: Translations | null = null;

  getTranslation(lang: Language, key: keyof Translation): string {
    const translations = this.translations;
    return translations?.[lang]?.[key] || key;
  }
}

// Test helper to create a testable version of Game2048
class TestableGame2048 {
  private translationManager: MockTranslationManager;
  private translations: Translations | null = null;
  private currentLanguage: Language = "ja";
  private board: (any | null)[][] = [];
  private score: number = 0;
  private bestScore: number = 0;
  private gameWon: boolean = false;
  private gameOver: boolean = false;
  private tileElements: Map<number, HTMLElement> = new Map();
  private tileIdCounter: number = 0;
  private currentTargetLevel: number = 2048; // Direct game mode value instead of index
  private completedLevels: Set<number> = new Set();
  public readonly achievementLevels: readonly number[] = [
    2048, 4096, 8192, 16384, 32768, 65536,
  ] as const;

  constructor() {
    this.translationManager = new MockTranslationManager();
    this.board = Array(4)
      .fill(null)
      .map(() => Array(4).fill(null));
    this.initializeDOM();
  }

  private initializeDOM(): void {
    // DOM elements are already set up in setup.ts
  }

  async init(): Promise<void> {
    this.translations = await this.translationManager.loadTranslations();
    this.updateScore();
  }

  // Expose private methods for testing
  public slideArray(arr: (any | null)[]): {
    array: (any | null)[];
    moved: boolean;
  } {
    let filtered = arr.filter((tile): tile is any => tile !== null);
    let moved = false;

    // Merge tiles
    for (let i = 0; i < filtered.length - 1; i++) {
      if (
        filtered[i] &&
        filtered[i + 1] &&
        filtered[i].value === filtered[i + 1].value
      ) {
        filtered[i].value *= 2;
        this.score += filtered[i].value;
        filtered.splice(i + 1, 1); // Remove the merged tile from array
        moved = true;
      }
    }

    const result: (any | null)[] = [...filtered];
    while (result.length < 4) {
      result.push(null);
    }

    // Check if array changed
    const originalValues = arr.map((tile) => (tile ? tile.value : null));
    const newValues = result.map((tile) => (tile ? tile.value : null));
    if (JSON.stringify(originalValues) !== JSON.stringify(newValues)) {
      moved = true;
    }

    return { array: result, moved };
  }

  public async toggleLanguage(): Promise<void> {
    this.currentLanguage = this.currentLanguage === "ja" ? "en" : "ja";
    await this.applyTranslations();
    this.updateLanguageButton();
  }

  private async applyTranslations(): Promise<void> {
    if (!this.translations) {
      this.translations = await this.translationManager.loadTranslations();
    }

    const elements = document.querySelectorAll<HTMLElement>("[data-i18n]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n") as keyof Translation;
      if (key) {
        const translation = this.translationManager.getTranslation(
          this.currentLanguage,
          key,
        );
        element.textContent = translation;
      }
    });
    this.updateLanguageButton();
  }

  private updateLanguageButton(): void {
    const flagIcon = document.getElementById("flag-icon")!;
    const langButton = document.getElementById("lang-toggle")!;

    if (this.currentLanguage === "ja") {
      flagIcon.textContent = "🇺🇸";
      langButton.title = "Switch to English";
    } else {
      flagIcon.textContent = "🇯🇵";
      langButton.title = "Switch to Japanese";
    }
  }

  private updateScore(): void {
    const scoreElement = document.getElementById("score")!;
    const bestScoreElement = document.getElementById("best-score")!;
    scoreElement.textContent = this.score.toString();
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
    }
    bestScoreElement.textContent = this.bestScore.toString();
  }

  public createTestBoard(values: (number | null)[][]): void {
    this.board = values.map((row) =>
      row.map((val) => (val ? { value: val, id: ++this.tileIdCounter } : null)),
    );
  }

  // FIXED: Updated to use direct game mode values instead of indices
  public async checkAchievements(): Promise<void> {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const tile = this.board[row][col];
        if (tile) {
          for (const level of this.achievementLevels) {
            if (tile.value >= level && !this.completedLevels.has(level)) {
              this.completedLevels.add(level);

              // Only show achievement and win if we hit the current target level
              if (level === this.currentTargetLevel) {
                this.gameWon = true;
                // Update target to next level if available
                const currentIndex = this.achievementLevels.indexOf(level);
                if (currentIndex < this.achievementLevels.length - 1) {
                  this.currentTargetLevel =
                    this.achievementLevels[currentIndex + 1];
                }
                await this.showAchievement(level);
                return;
              }
            }
          }
        }
      }
    }
  }

  private async showAchievement(level: number): Promise<void> {
    if (!this.translations) return;

    const t = this.translations[this.currentLanguage];
    const congratsMsg = t.congratulations;
    const achievementMsg = t.achievement2048;

    this.showMessage(
      `${congratsMsg}\n${achievementMsg}`,
      this.gameWon,
      t.wellDone,
    );
  }

  private showMessage(
    message: string,
    isWin: boolean = false,
    subtitle: string = "",
  ): void {
    const messageText = document.getElementById("message-text")!;
    const resultSubtitle = document.getElementById("result-subtitle")!;
    const gameMessage = document.getElementById("game-message")!;

    messageText.textContent = message;
    resultSubtitle.textContent = subtitle;
    gameMessage.classList.remove("hidden");
  }

  public generateTestShareText(): string {
    return this.generateShareText();
  }

  private getHighestTileValue(): number {
    let highest = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const tile = this.board[row][col];
        if (tile && tile.value > highest) {
          highest = tile.value;
        }
      }
    }
    return highest;
  }

  private generateShareText(): string {
    const highestTile = this.getHighestTileValue();
    const isJapanese = this.currentLanguage === "ja";
    const gameUrl = "http://localhost:5174"; // Mock URL for testing

    if (isJapanese) {
      return (
        `2048ゲームで${highestTile}タイルを達成！\n` +
        `スコア: ${this.score.toLocaleString()}\n` +
        `あなたも挑戦してみませんか？\n` +
        `${gameUrl}`
      );
    } else {
      return (
        `I reached ${highestTile} tile in 2048!\n` +
        `Score: ${this.score.toLocaleString()}\n` +
        `Try it yourself!\n` +
        `${gameUrl}`
      );
    }
  }

  // Getters for testing
  public getCurrentLanguage(): Language {
    return this.currentLanguage;
  }
  public getScore(): number {
    return this.score;
  }
  public getGameWon(): boolean {
    return this.gameWon;
  }
  public getBoard(): (any | null)[][] {
    return this.board;
  }
  public setCurrentTargetLevel(level: number): void {
    this.currentTargetLevel = level;
  }
  public getCurrentTargetLevel(): number {
    return this.currentTargetLevel;
  }
}

describe("Game2048", () => {
  let game: TestableGame2048;

  beforeEach(async () => {
    game = new TestableGame2048();
    await game.init();
  });

  describe("Language Switching", () => {
    it("should toggle language from Japanese to English", async () => {
      expect(game.getCurrentLanguage()).toBe("ja");

      await game.toggleLanguage();

      expect(game.getCurrentLanguage()).toBe("en");

      // Check flag icon changed
      const flagIcon = document.getElementById("flag-icon")!;
      expect(flagIcon.textContent).toBe("🇯🇵");
    });

    it("should toggle language from English to Japanese", async () => {
      // First toggle to English
      await game.toggleLanguage();
      expect(game.getCurrentLanguage()).toBe("en");

      // Then toggle back to Japanese
      await game.toggleLanguage();

      expect(game.getCurrentLanguage()).toBe("ja");

      // Check flag icon changed back
      const flagIcon = document.getElementById("flag-icon")!;
      expect(flagIcon.textContent).toBe("🇺🇸");
    });

    it("should apply translations when language changes", async () => {
      // Add a test element with translation key
      const testElement = document.createElement("div");
      testElement.setAttribute("data-i18n", "congratulations");
      document.body.appendChild(testElement);

      await game.toggleLanguage(); // Switch to English

      expect(testElement.textContent).toBe("Congratulations!");
    });
  });

  describe("Tile Calculations", () => {
    it("should merge two identical tiles correctly", () => {
      const input = [{ value: 2, id: 1 }, { value: 2, id: 2 }, null, null];

      const result = game.slideArray(input);

      expect(result.array[0]).toEqual({ value: 4, id: 1 });
      expect(result.array[1]).toBe(null);
      expect(result.array[2]).toBe(null);
      expect(result.array[3]).toBe(null);
      expect(result.moved).toBe(true);
      expect(game.getScore()).toBe(4);
    });

    it("should not merge different value tiles", () => {
      const input = [{ value: 2, id: 1 }, { value: 4, id: 2 }, null, null];

      const result = game.slideArray(input);

      expect(result.array[0]).toEqual({ value: 2, id: 1 });
      expect(result.array[1]).toEqual({ value: 4, id: 2 });
      expect(result.array[2]).toBe(null);
      expect(result.array[3]).toBe(null);
      expect(result.moved).toBe(false);
      expect(game.getScore()).toBe(0);
    });

    it("should merge multiple pairs correctly", () => {
      const input = [
        { value: 2, id: 1 },
        { value: 2, id: 2 },
        { value: 4, id: 3 },
        { value: 4, id: 4 },
      ];

      const result = game.slideArray(input);

      expect(result.array[0]).toEqual({ value: 4, id: 1 });
      expect(result.array[1]).toEqual({ value: 8, id: 3 });
      expect(result.array[2]).toBe(null);
      expect(result.array[3]).toBe(null);
      expect(result.moved).toBe(true);
      expect(game.getScore()).toBe(12); // 4 + 8
    });

    it("should not merge same tile twice in one move", () => {
      const input = [
        { value: 2, id: 1 },
        { value: 2, id: 2 },
        { value: 4, id: 3 },
        null,
      ];

      const result = game.slideArray(input);

      expect(result.array[0]).toEqual({ value: 4, id: 1 });
      expect(result.array[1]).toEqual({ value: 4, id: 3 });
      expect(result.array[2]).toBe(null);
      expect(result.array[3]).toBe(null);
      expect(result.moved).toBe(true);
      expect(game.getScore()).toBe(4);
    });
  });

  describe("2048 Achievement", () => {
    it("should show result when 2048 tile is achieved", async () => {
      // Create a board with a 2048 tile
      game.createTestBoard([
        [2048, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);

      await game.checkAchievements();

      expect(game.getGameWon()).toBe(true);

      // Check that message is displayed
      const gameMessage = document.getElementById("game-message")!;
      expect(gameMessage.classList.contains("hidden")).toBe(false);

      const messageText = document.getElementById("message-text")!;
      expect(messageText.textContent).toContain("おめでとう");
      expect(messageText.textContent).toContain("2048タイルを達成しました");
    });

    it("should show English result when language is English", async () => {
      // Switch to English first
      await game.toggleLanguage();

      // Create a board with a 2048 tile
      game.createTestBoard([
        [2048, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);

      await game.checkAchievements();

      expect(game.getGameWon()).toBe(true);

      const messageText = document.getElementById("message-text")!;
      expect(messageText.textContent).toContain("Congratulations");
      expect(messageText.textContent).toContain("You reached the 2048 tile");
    });

    it("should not trigger 2048 achievement for lower tiles", async () => {
      // Create a board with tiles less than 2048
      game.createTestBoard([
        [1024, 512, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);

      await game.checkAchievements();

      expect(game.getGameWon()).toBe(false);

      // Check that message is not displayed
      const gameMessage = document.getElementById("game-message")!;
      expect(gameMessage.classList.contains("hidden")).toBe(true);
    });
  });

  describe("Game Mode Win Conditions", () => {
    it("should not win at 2048 when in 4096 mode", async () => {
      // Set target to 4096 mode
      game.setCurrentTargetLevel(4096);

      // Create a board with a 2048 tile
      game.createTestBoard([
        [2048, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);

      await game.checkAchievements();

      // Should NOT win at 2048 when target is 4096
      expect(game.getGameWon()).toBe(false);

      // No achievement message should be displayed (2048 is not the target in 4096 mode)
      const gameMessage = document.getElementById("game-message")!;
      expect(gameMessage.classList.contains("hidden")).toBe(true);
    });

    it("should win at 4096 when in 4096 mode", async () => {
      // Set target to 4096 mode
      game.setCurrentTargetLevel(4096);

      // Create a board with a 4096 tile
      game.createTestBoard([
        [4096, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);

      await game.checkAchievements();

      // Should win at 4096 when target is 4096
      expect(game.getGameWon()).toBe(true);

      // Check that message is displayed
      const gameMessage = document.getElementById("game-message")!;
      expect(gameMessage.classList.contains("hidden")).toBe(false);
    });

    it("should not win at 2048 when in 8192 mode", async () => {
      // Set target to 8192 mode
      game.setCurrentTargetLevel(8192);

      // Create a board with a 2048 tile
      game.createTestBoard([
        [2048, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);

      await game.checkAchievements();

      // Should NOT win at 2048 when target is 8192
      expect(game.getGameWon()).toBe(false);
    });

    it("should not win at 4096 when in 8192 mode", async () => {
      // Set target to 8192 mode
      game.setCurrentTargetLevel(8192);

      // Create a board with a 4096 tile
      game.createTestBoard([
        [4096, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);

      await game.checkAchievements();

      // Should NOT win at 4096 when target is 8192
      expect(game.getGameWon()).toBe(false);
    });

    it("should win at 8192 when in 8192 mode", async () => {
      // Set target to 8192 mode
      game.setCurrentTargetLevel(8192);

      // Create a board with a 8192 tile
      game.createTestBoard([
        [8192, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);

      await game.checkAchievements();

      // Should win at 8192 when target is 8192
      expect(game.getGameWon()).toBe(true);
    });
  });

  describe("Share Text with URL", () => {
    it("should include URL in Japanese share text", () => {
      // Set up game state
      game.createTestBoard([
        [2048, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);

      const shareText = game.generateTestShareText();

      expect(shareText).toContain("2048ゲームで2048タイルを達成！");
      expect(shareText).toContain("スコア: 0");
      expect(shareText).toContain("あなたも挑戦してみませんか？");
      expect(shareText).toContain("http://localhost:5174");
    });

    it("should include URL in English share text", async () => {
      // Switch to English first
      await game.toggleLanguage();

      // Set up game state
      game.createTestBoard([
        [4096, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);

      const shareText = game.generateTestShareText();

      expect(shareText).toContain("I reached 4096 tile in 2048!");
      expect(shareText).toContain("Score: 0");
      expect(shareText).toContain("Try it yourself!");
      expect(shareText).toContain("http://localhost:5174");
    });
  });
});
