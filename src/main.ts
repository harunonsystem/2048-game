import type {
  Translation,
  Translations,
  Language,
  Direction,
  GameMode,
  TileData,
  TouchData,
  DebugGame,
} from "./types";
import type { DebugManager } from "./debug";
import translationsData from "./translations.json";
import { trackEvent } from "./analytics";
import { getHighestTileValue, isGameOver, moveBoard } from "./game";

// Umami analytics (Production only)
function loadUmamiAnalytics(): void {
  if (!import.meta.env.PROD) return;

  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID_2048_GAME;
  if (!websiteId) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://analytics.harunonsystem.com/umami.js";
  script.setAttribute("data-website-id", websiteId);
  document.head.appendChild(script);
}

class Game2048 implements DebugGame {
  private readonly translations = translationsData as Translations;
  private currentLanguage: Language;
  private debugManager: DebugManager | null = null;

  // Game state
  public board: (TileData | null)[][];
  public score: number;
  private bestScore: number;
  public gameWon: boolean;
  public gameOver: boolean;
  private tileElements: Map<number, HTMLElement>;
  private tileIdCounter: number;
  private moveCount: number;

  // Achievement system
  public readonly achievementLevels: readonly GameMode[] = [
    2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288,
  ] as const;
  public currentTargetLevel: GameMode;
  private completedLevels: Set<GameMode>;

  // DOM elements
  private scoreElement!: HTMLElement;
  private bestScoreElement!: HTMLElement;
  private tileContainer!: HTMLElement;
  private gameMessage!: HTMLElement;
  private messageText!: HTMLElement;
  private finalScoreElement!: HTMLElement;
  private resultBestScoreElement!: HTMLElement;
  private resultIcon!: HTMLElement;
  private resultSubtitle!: HTMLElement;
  private highestTileElement!: HTMLElement;
  private celebrationEffects!: HTMLElement;
  private continueButton!: HTMLElement;
  private shareXButton!: HTMLElement;
  private copyResultButton!: HTMLElement;

  constructor() {
    this.currentLanguage = this.loadLanguage();

    this.board = Array(4)
      .fill(null)
      .map(() => Array(4).fill(null));
    this.score = 0;
    this.bestScore = this.loadBestScore();
    this.gameWon = false;
    this.gameOver = false;
    this.tileElements = new Map();
    this.tileIdCounter = 0;
    this.moveCount = 0;

    this.currentTargetLevel = this.loadGameMode();
    this.completedLevels = new Set();

    this.initializeDOM();
    // Setup keyboard events immediately for better UX
    this.setupKeyboardEvents();
    this.init();
  }

  private initializeDOM(): void {
    this.scoreElement = document.getElementById("score")!;
    this.bestScoreElement = document.getElementById("best-score")!;
    this.tileContainer = document.getElementById("tile-container")!;
    this.gameMessage = document.getElementById("game-message")!;
    this.messageText = document.getElementById("message-text")!;
    this.finalScoreElement = document.getElementById("final-score")!;
    this.resultBestScoreElement = document.getElementById("result-best-score")!;
    this.resultIcon = document.getElementById("result-icon")!;
    this.resultSubtitle = document.getElementById("result-subtitle")!;
    this.highestTileElement = document.getElementById("highest-tile")!;
    this.celebrationEffects = document.getElementById("celebration-effects")!;
    this.continueButton = document.getElementById("continue-btn")!;
    this.shareXButton = document.getElementById("share-x-btn")!;
    this.copyResultButton = document.getElementById("copy-result-btn")!;
  }

  private setupKeyboardEvents(): void {
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
    
    // Fix focus issue when returning to tab
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        // Tab became visible again - ensure focus for keyboard events
        document.body.focus();
      }
    });
    
    // Also handle window focus events
    window.addEventListener("focus", () => {
      document.body.focus();
    });
  }

  private init(): void {
    this.updateScore();
    this.addRandomTile();
    this.addRandomTile();
    this.setupEventListeners();
    this.applyTranslations();
    this.updateModeButtons();
    trackEvent("game_start", {
      mode: this.currentTargetLevel,
      language: this.currentLanguage,
    });
  }

  // Language management
  private loadLanguage(): Language {
    return (localStorage.getItem("2048-language") as Language) || "ja";
  }

  private saveLanguage(): void {
    localStorage.setItem("2048-language", this.currentLanguage);
  }

  private toggleLanguage(): void {
    const previousLanguage = this.currentLanguage;
    this.currentLanguage = this.currentLanguage === "ja" ? "en" : "ja";
    this.saveLanguage();
    this.applyTranslations();
    this.updateLanguageButton();
    trackEvent("language_change", {
      from: previousLanguage,
      to: this.currentLanguage,
    });
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

  private applyTranslations(): void {
    const elements = document.querySelectorAll<HTMLElement>("[data-i18n]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n") as keyof Translation;
      if (key) {
        const translation =
          this.translations[this.currentLanguage]?.[key] || key;
        element.textContent = translation;
      }
    });
    this.updateLanguageButton();
  }

  // Game logic
  private setupEventListeners(): void {
    // Keyboard events are already set up in constructor
    document
      .getElementById("restart-btn")!
      .addEventListener("click", () => this.restart());
    document.getElementById("try-again-btn")!.addEventListener("click", () => {
      const isGameOver = this.gameOver;
      trackEvent("replay_click", {
        mode: isGameOver
          ? this.currentTargetLevel
          : this.achievementLevels[
              Math.max(0, this.achievementLevels.indexOf(this.currentTargetLevel) - 1)
            ],
        score: this.score,
        from: isGameOver ? "game_over" : "game_won",
        language: this.currentLanguage,
      });
      this.restart();
    });
    document
      .getElementById("lang-toggle")!
      .addEventListener("click", () => this.toggleLanguage());

    this.shareXButton.addEventListener("click", () => this.shareToX());
    this.copyResultButton.addEventListener("click", () => this.copyResult());
    this.continueButton.addEventListener("click", () => this.continueGame());

    document
      .querySelectorAll<HTMLButtonElement>(".mode-button")
      .forEach((button) => {
        button.addEventListener("click", () => this.changeGameMode(button));
      });

    this.setupTouchEvents();

    // Setup debug controls asynchronously (development only)
    this.setupDebugControls();
  }

  private setupTouchEvents(): void {
    let touchData: TouchData | null = null;

    document.addEventListener("touchstart", (e: TouchEvent) => {
      touchData = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
      };
    });

    document.addEventListener("touchend", (e: TouchEvent) => {
      if (!touchData) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = touchData.startX - endX;
      const diffY = touchData.startY - endY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 30) this.move("left");
        else if (diffX < -30) this.move("right");
      } else {
        if (diffY > 30) this.move("up");
        else if (diffY < -30) this.move("down");
      }

      touchData = null;
    });
  }

  private handleKeyPress(e: KeyboardEvent): void {
    if (this.gameOver && !["KeyR", "Space"].includes(e.code)) return;

    const keyActions: Record<string, Direction> = {
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
      ArrowUp: "up",
      KeyW: "up",
      ArrowDown: "down",
      KeyS: "down",
    };

    if (keyActions[e.code]) {
      e.preventDefault();
      this.move(keyActions[e.code]);
    } else if (["KeyR", "Space"].includes(e.code)) {
      e.preventDefault();
      this.restart();
    }
  }

  private move(direction: Direction): void {
    if (this.gameOver) return;

    const result = moveBoard(this.board, direction);
    if (result.moved) {
      this.moveCount++;
      this.score += result.scoreDelta;
      const tilesById = new Map(
        result.board
          .flat()
          .filter((tile): tile is TileData => tile !== null)
          .map((tile) => [tile.id, tile]),
      );
      result.merges.forEach(({ survivorId, consumedId }) => {
        this.removeTileElement(consumedId);
        const survivor = tilesById.get(survivorId);
        const element = this.tileElements.get(survivorId);
        if (survivor && element) {
          this.updateTileElement(element, survivor.value);
          element.classList.add("tile-merged");
        }
      });
      this.board = result.board;
      this.addRandomTile();
      this.updateDisplay();
      this.checkGameState();
    }
  }

  private addRandomTile(): void {
    const emptyCells: { row: number; col: number }[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.board[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomCell =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const value = Math.random() < 0.9 ? 2 : 4;
      const tileObj = this.createTileObject(
        value,
        randomCell.row,
        randomCell.col,
      );
      this.board[randomCell.row][randomCell.col] = tileObj;
    }
  }

  public createTileObject(value: number, row: number, col: number): TileData {
    const id = ++this.tileIdCounter;
    const tileObj: TileData = { id, value, row, col };

    const element = document.createElement("div");
    this.updateTileElement(element, value);
    element.setAttribute("data-tile-id", id.toString());
    element.textContent = value.toString();
    this.positionTile(element, row, col);

    this.tileElements.set(id, element);
    this.tileContainer.appendChild(element);

    return tileObj;
  }

  private updateTileElement(element: HTMLElement, value: number): void {
    element.className = `tile tile-${value}`;
    element.textContent = value.toString();
    if (value > 2048) {
      element.classList.add("super");
    }
  }

  private positionTile(element: HTMLElement, row: number, col: number): void {
    const cellSize = (100 - 7.5) / 4;
    const gap = 2.5;
    element.style.left = `${col * (cellSize + gap)}%`;
    element.style.top = `${row * (cellSize + gap)}%`;
  }

  private updateDisplay(): void {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const tile = this.board[row][col];
        if (tile) {
          this.moveTile(tile, row, col);
        }
      }
    }
  }

  private moveTile(tileObj: TileData, newRow: number, newCol: number): void {
    const element = this.tileElements.get(tileObj.id);
    if (element) {
      this.positionTile(element, newRow, newCol);
      tileObj.row = newRow;
      tileObj.col = newCol;
    }
  }

  public removeTile(tileObj: TileData): void {
    this.removeTileElement(tileObj.id);
  }

  private removeTileElement(tileId: number): void {
    const element = this.tileElements.get(tileId);
    if (element) {
      element.remove();
      this.tileElements.delete(tileId);
    }
  }

  public updateScore(): void {
    this.scoreElement.textContent = this.score.toString();
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.saveBestScore();
    }
    this.bestScoreElement.textContent = this.bestScore.toString();
  }

  public async checkGameState(): Promise<void> {
    this.updateScore();

    if (!this.gameWon) {
      await this.checkAchievements();
    }

    if (isGameOver(this.board)) {
      await this.handleGameOver();
    }
  }

  private async checkAchievements(): Promise<void> {
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
                trackEvent("game_won", {
                  mode: level,
                  score: this.score,
                  highestTile: getHighestTileValue(this.board),
                  moves: this.moveCount,
                  language: this.currentLanguage,
                });
                // Update target to next level if available
                const currentIndex = this.achievementLevels.indexOf(level);
                if (currentIndex < this.achievementLevels.length - 1) {
                  this.currentTargetLevel = this.achievementLevels[currentIndex + 1];
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

  private async showAchievement(level: GameMode): Promise<void> {
    if (!this.translations) return;

    const t = this.translations[this.currentLanguage];
    const isNewRecord = this.score > this.bestScore;
    const congratsMsg = t.congratulations;
    const achievementKey = `achievement${level}` as keyof Translation;
    const achievementMsg =
      t[achievementKey] || t.achievement2048.replace("2048", level.toString());
    const subtitle = this.gameWon
      ? isNewRecord
        ? t.newRecord
        : t.wellDone
      : t.keepGoing;

    this.showMessage(
      `${congratsMsg}\n${achievementMsg}`,
      this.gameWon,
      subtitle,
    );
  }

  private async handleGameOver(): Promise<void> {
    this.gameOver = true;
    trackEvent("game_over", {
      mode: this.currentTargetLevel,
      score: this.score,
      highestTile: getHighestTileValue(this.board),
      moves: this.moveCount,
      language: this.currentLanguage,
    });
    if (!this.translations) return;

    const t = this.translations[this.currentLanguage];
    const gameOverMsg = t.gameOver;
    const noMovesMsg = t.noMovesLeft;
    const subtitle = this.score > this.bestScore * 0.8 ? t.wellDone : "";

    this.showMessage(`${gameOverMsg}\n${noMovesMsg}`, false, subtitle);
  }

  private showMessage(
    message: string,
    isWin: boolean = false,
    subtitle: string = "",
  ): void {
    this.messageText.textContent = message;
    this.resultSubtitle.textContent = subtitle;

    const highestTile = getHighestTileValue(this.board);
    this.finalScoreElement.textContent = this.score.toString();
    this.resultBestScoreElement.textContent = this.bestScore.toString();
    this.highestTileElement.textContent = highestTile.toString();

    this.resultIcon.className = `result-icon ${isWin ? "win" : "lose"}`;
    this.celebrationEffects.className = `celebration-effects ${isWin ? "win" : ""}`;

    this.updateMessageButtons(isWin);
    this.gameMessage.classList.remove("hidden");
  }

  private updateMessageButtons(isWin: boolean): void {
    if (!this.translations) return;

    const tryAgainBtn = document.getElementById("try-again-btn")!;

    if (isWin && !this.gameOver) {
      this.continueButton.classList.remove("hidden");
      tryAgainBtn.style.order = "2";

      const newGameText = this.translations[this.currentLanguage].newGame;
      tryAgainBtn.setAttribute("data-i18n", "newGame");
      tryAgainBtn.textContent = newGameText;
    } else {
      // Game over or lose - hide continue button
      this.continueButton.classList.add("hidden");
      tryAgainBtn.style.order = "1";

      const tryAgainText = this.translations[this.currentLanguage].tryAgain;
      tryAgainBtn.setAttribute("data-i18n", "tryAgain");
      tryAgainBtn.textContent = tryAgainText;
    }
  }

  private hideMessage(): void {
    this.gameMessage.classList.add("hidden");
  }

  private continueGame(): void {
    this.gameWon = false;
    this.hideMessage();
  }

  // Social sharing
  private generateShareText(): string {
    const highestTile = getHighestTileValue(this.board);
    const isJapanese = this.currentLanguage === "ja";
    const gameUrl = window.location.href;

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

  private shareToX(): void {
    const text = this.generateShareText();
    const tweetText = encodeURIComponent(text);
    const xUrl = `https://x.com/intent/tweet?text=${tweetText}`;
    window.open(xUrl, "_blank", "width=600,height=400");
    trackEvent("share_x_click", {
      mode: this.currentTargetLevel,
      score: this.score,
      highestTile: getHighestTileValue(this.board),
      language: this.currentLanguage,
    });
  }

  private async copyResult(): Promise<void> {
    const text = this.generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      this.showCopyFeedback();
    } catch {
      this.fallbackCopyText(text);
    }
    trackEvent("copy_result_click", {
      mode: this.currentTargetLevel,
      score: this.score,
      highestTile: getHighestTileValue(this.board),
      language: this.currentLanguage,
    });
  }

  private showCopyFeedback(): void {
    const originalText = this.copyResultButton.textContent;
    this.copyResultButton.textContent = "✓";
    this.copyResultButton.style.background =
      "linear-gradient(135deg, #10b981, #059669)";

    setTimeout(() => {
      this.copyResultButton.textContent = originalText;
      this.copyResultButton.style.background = "";
    }, 2000);
  }

  private fallbackCopyText(text: string): void {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (error) {
      console.warn("Copy fallback failed:", error);
    }
    document.body.removeChild(textArea);
  }

  // Game management
  private restart(): void {
    this.tileElements.forEach((element) => element.remove());
    this.tileElements.clear();
    this.tileIdCounter = 0;

    this.board = Array(4)
      .fill(null)
      .map(() => Array(4).fill(null));
    this.score = 0;
    this.gameWon = false;
    this.gameOver = false;
    this.moveCount = 0;
    this.completedLevels.clear();

    this.hideMessage();
    this.updateScore();
    this.addRandomTile();
    this.addRandomTile();

    trackEvent("game_start", {
      mode: this.currentTargetLevel,
      language: this.currentLanguage,
    });
  }

  // Persistence
  private loadBestScore(): number {
    return parseInt(localStorage.getItem("2048-best-score") || "0");
  }

  private saveBestScore(): void {
    localStorage.setItem("2048-best-score", this.bestScore.toString());
  }

  private loadGameMode(): GameMode {
    const saved = localStorage.getItem("gameMode");
    const parsed = saved ? parseInt(saved) : 2048;
    // Fall back to 2048 mode if the stored value is invalid
    return this.achievementLevels.includes(parsed as GameMode)
      ? (parsed as GameMode)
      : 2048;
  }

  private saveGameMode(): void {
    localStorage.setItem("gameMode", this.currentTargetLevel.toString());
  }

  private changeGameMode(button: HTMLButtonElement): void {
    const targetValue = parseInt(button.dataset.target!);

    if (this.achievementLevels.includes(targetValue as GameMode)) {
      const previousMode = this.currentTargetLevel;
      this.currentTargetLevel = targetValue as GameMode;
      this.saveGameMode();
      this.updateModeButtons();
      if (previousMode !== targetValue) {
        trackEvent("mode_change", {
          from: previousMode,
          to: targetValue,
          language: this.currentLanguage,
        });
      }
      this.restart();
    }
  }

  private updateModeButtons(): void {
    document
      .querySelectorAll<HTMLButtonElement>(".mode-button")
      .forEach((btn) => {
        btn.classList.toggle(
          "active",
          parseInt(btn.dataset.target!) === this.currentTargetLevel,
        );
      });
  }

  // Debug functionality (Development only)
  private async setupDebugControls(): Promise<void> {
    // Only load debug functionality in development environment
    if (import.meta.env.PROD) {
      return;
    }

    try {
      const { DebugManager } = await import("./debug");
      this.debugManager = new DebugManager(this);
      this.debugManager.setupDebugControls();
    } catch (error) {
      console.warn("Debug functionality not available:", error);
    }
  }
}

// Initialize game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new Game2048();
  loadUmamiAnalytics();
});
