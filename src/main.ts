import type {
  Translation,
  Translations,
  Language,
  Direction,
  GameMode,
  TileData,
  TouchData,
} from "./types";
import translationsData from "./translations.json";

// Development-only debug functionality will be imported dynamically

class TranslationManager {
  private translations: Translations | null = null;

  async loadTranslations(): Promise<Translations> {
    if (this.translations) return this.translations;

    this.translations = translationsData as Translations;
    return this.translations;
  }

  getTranslation(lang: Language, key: keyof Translation): string {
    return this.translations?.[lang]?.[key] || key;
  }
}

class Game2048 {
  private translationManager: TranslationManager;
  private translations: Translations | null = null;
  private currentLanguage: Language;
  private debugManager: any = null;

  // Game state
  public board: (TileData | null)[][];
  public score: number;
  private bestScore: number;
  public gameWon: boolean;
  public gameOver: boolean;
  private tileElements: Map<number, HTMLElement>;
  private tileIdCounter: number;

  // Achievement system
  public readonly achievementLevels: readonly GameMode[] = [
    2048, 4096, 8192, 16384, 32768, 65536,
  ] as const;
  public currentTargetLevel: number;
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
    this.translationManager = new TranslationManager();
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

    this.currentTargetLevel = this.loadGameMode();
    this.completedLevels = new Set();

    this.initializeDOM();
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

  private async init(): Promise<void> {
    this.translations = await this.translationManager.loadTranslations();
    this.updateScore();
    this.addRandomTile();
    this.addRandomTile();
    this.setupEventListeners();
    this.applyTranslations();
    this.updateModeButtons();
  }

  // Language management
  private loadLanguage(): Language {
    return (localStorage.getItem("2048-language") as Language) || "ja";
  }

  private saveLanguage(): void {
    localStorage.setItem("2048-language", this.currentLanguage);
  }

  private async toggleLanguage(): Promise<void> {
    this.currentLanguage = this.currentLanguage === "ja" ? "en" : "ja";
    this.saveLanguage();
    await this.applyTranslations();
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

  // Game logic
  private setupEventListeners(): void {
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
    document
      .getElementById("restart-btn")!
      .addEventListener("click", () => this.restart());
    document
      .getElementById("try-again-btn")!
      .addEventListener("click", () => this.restart());
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

    const newBoard = this.board.map((row) => [...row]);
    let moved = false;

    const moveActions: Record<Direction, () => boolean> = {
      left: () => this.moveLeft(newBoard),
      right: () => this.moveRight(newBoard),
      up: () => this.moveUp(newBoard),
      down: () => this.moveDown(newBoard),
    };

    moved = moveActions[direction]();

    if (moved) {
      this.board = newBoard;
      this.addRandomTile();
      this.updateDisplay();
      this.checkGameState();
    }
  }

  private moveLeft(board: (TileData | null)[][]): boolean {
    let moved = false;
    for (let row = 0; row < 4; row++) {
      const result = this.slideArray(board[row]);
      if (result.moved) moved = true;
      board[row] = result.array;
    }
    return moved;
  }

  private moveRight(board: (TileData | null)[][]): boolean {
    let moved = false;
    for (let row = 0; row < 4; row++) {
      const reversed = board[row].slice().reverse();
      const result = this.slideArray(reversed);
      if (result.moved) moved = true;
      board[row] = result.array.reverse();
    }
    return moved;
  }

  private moveUp(board: (TileData | null)[][]): boolean {
    let moved = false;
    for (let col = 0; col < 4; col++) {
      const column: (TileData | null)[] = [
        board[0][col],
        board[1][col],
        board[2][col],
        board[3][col],
      ];
      const result = this.slideArray(column);
      if (result.moved) moved = true;
      for (let row = 0; row < 4; row++) {
        board[row][col] = result.array[row];
      }
    }
    return moved;
  }

  private moveDown(board: (TileData | null)[][]): boolean {
    let moved = false;
    for (let col = 0; col < 4; col++) {
      const column: (TileData | null)[] = [
        board[3][col],
        board[2][col],
        board[1][col],
        board[0][col],
      ];
      const result = this.slideArray(column);
      if (result.moved) moved = true;
      for (let row = 0; row < 4; row++) {
        board[3 - row][col] = result.array[row];
      }
    }
    return moved;
  }

  private slideArray(arr: (TileData | null)[]): {
    array: (TileData | null)[];
    moved: boolean;
  } {
    let filtered = arr.filter((tile): tile is TileData => tile !== null);
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
        this.removeTile(filtered[i + 1]);
        filtered.splice(i + 1, 1); // Remove the merged tile from array
        moved = true;

        // Add merge animation
        const element = this.tileElements.get(filtered[i].id);
        if (element) {
          this.updateTileElement(element, filtered[i].value);
          element.classList.add("tile-merged");
        }
      }
    }

    const result: (TileData | null)[] = [...filtered];
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
        if (tile && (tile.row !== row || tile.col !== col)) {
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
    const element = this.tileElements.get(tileObj.id);
    if (element) {
      element.remove();
      this.tileElements.delete(tileObj.id);
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

    if (this.isGameOver()) {
      await this.handleGameOver();
    }
  }

  private async checkAchievements(): Promise<void> {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const tile = this.board[row][col];
        if (tile) {
          for (let i = 0; i < this.achievementLevels.length; i++) {
            const level = this.achievementLevels[i];
            if (tile.value >= level && !this.completedLevels.has(level)) {
              this.completedLevels.add(level);

              if (i >= this.currentTargetLevel) {
                this.gameWon = true;
                this.currentTargetLevel = Math.max(
                  this.currentTargetLevel,
                  i + 1,
                );
              }

              await this.showAchievement(level);
              if (this.gameWon) return;
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
    if (!this.translations) return;

    const t = this.translations[this.currentLanguage];
    const gameOverMsg = t.gameOver;
    const noMovesMsg = t.noMovesLeft;
    const subtitle = this.score > this.bestScore * 0.8 ? t.wellDone : "";

    this.showMessage(`${gameOverMsg}\n${noMovesMsg}`, false, subtitle);
  }

  private isGameOver(): boolean {
    // Check for empty cells
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.board[row][col] === null) return false;
      }
    }

    // Check for possible merges
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const current = this.board[row][col];
        if (current) {
          const neighbors = [
            { r: row, c: col + 1 },
            { r: row + 1, c: col },
          ];

          for (const neighbor of neighbors) {
            if (neighbor.r < 4 && neighbor.c < 4) {
              const neighborTile = this.board[neighbor.r][neighbor.c];
              if (neighborTile && current.value === neighborTile.value) {
                return false;
              }
            }
          }
        }
      }
    }
    return true;
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

  private showMessage(
    message: string,
    isWin: boolean = false,
    subtitle: string = "",
  ): void {
    this.messageText.textContent = message;
    this.resultSubtitle.textContent = subtitle;

    const highestTile = this.getHighestTileValue();
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

    console.log("updateMessageButtons:", { isWin, gameOver: this.gameOver });
    const tryAgainBtn = document.getElementById("try-again-btn")!;

    if (isWin && !this.gameOver) {
      this.continueButton.classList.remove("hidden");
      tryAgainBtn.style.order = "2";

      const newGameText = this.translations[this.currentLanguage].newGame;
      tryAgainBtn.setAttribute("data-i18n", "newGame");
      tryAgainBtn.textContent = newGameText;
    } else {
      // Game over or lose - hide continue button
      console.log("Hiding continue button");
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
    const highestTile = this.getHighestTileValue();
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
  }

  private async copyResult(): Promise<void> {
    const text = this.generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      this.showCopyFeedback();
    } catch (err) {
      console.log("Copy failed:", err);
      this.fallbackCopyText(text);
    }
  }

  private showCopyFeedback(): void {
    const originalText = this.copyResultButton.innerHTML;
    this.copyResultButton.innerHTML = "✓";
    this.copyResultButton.style.background =
      "linear-gradient(135deg, #10b981, #059669)";

    setTimeout(() => {
      this.copyResultButton.innerHTML = originalText;
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
    } catch (err) {
      console.log("Fallback copy failed:", err);
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
    this.completedLevels.clear();

    this.hideMessage();
    this.updateScore();
    this.addRandomTile();
    this.addRandomTile();
  }

  // Persistence
  private loadBestScore(): number {
    return parseInt(localStorage.getItem("2048-best-score") || "0");
  }

  private saveBestScore(): void {
    localStorage.setItem("2048-best-score", this.bestScore.toString());
  }

  private loadGameMode(): number {
    const saved = localStorage.getItem("gameMode");
    return saved ? parseInt(saved) : 0;
  }

  private saveGameMode(): void {
    localStorage.setItem("gameMode", this.currentTargetLevel.toString());
  }

  private changeGameMode(button: HTMLButtonElement): void {
    const targetValue = parseInt(button.dataset.target!);
    const targetIndex = this.achievementLevels.indexOf(targetValue as GameMode);

    if (targetIndex !== -1) {
      this.currentTargetLevel = targetIndex;
      this.saveGameMode();
      this.updateModeButtons();
      this.restart();
    }
  }

  private updateModeButtons(): void {
    const targetValue = this.achievementLevels[this.currentTargetLevel];
    document
      .querySelectorAll<HTMLButtonElement>(".mode-button")
      .forEach((btn) => {
        btn.classList.toggle(
          "active",
          parseInt(btn.dataset.target!) === targetValue,
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
});
