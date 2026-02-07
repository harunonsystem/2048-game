// Debug functionality - Development only
import type { GameMode } from "./types";

export class DebugManager {
  private game: any; // Game2048 instance

  constructor(gameInstance: any) {
    this.game = gameInstance;
  }

  public setupDebugControls(): void {
    // Only create debug panel in development environment
    if (import.meta.env.PROD) {
      return;
    }

    // Create debug panel dynamically
    this.createDebugPanel();
  }

  protected createDebugPanel(): void {
    // Create debug panel element
    const debugPanel = document.createElement("div");
    debugPanel.id = "debug-panel";
    debugPanel.className = "debug-panel";

    debugPanel.innerHTML = `
      <h3>🐛 Debug Controls</h3>
      <div class="debug-buttons">
        <button id="debug-gameover" class="debug-btn">Game Over</button>
        <button id="debug-win-2048" class="debug-btn">Win 2048</button>
        <button id="debug-win-4096" class="debug-btn">Win 4096</button>
        <button id="debug-fill-board" class="debug-btn">Fill Board</button>
        <button id="debug-add-2048" class="debug-btn">Add 2048 Tile</button>
      </div>
    `;

    // Append to body
    document.body.appendChild(debugPanel);

    // Setup event listeners for debug buttons
    document.getElementById("debug-gameover")?.addEventListener("click", () => {
      this.debugTriggerGameOver();
    });

    document.getElementById("debug-win-2048")?.addEventListener("click", () => {
      this.debugTriggerWin(2048);
    });

    document.getElementById("debug-win-4096")?.addEventListener("click", () => {
      this.debugTriggerWin(4096);
    });

    document
      .getElementById("debug-fill-board")
      ?.addEventListener("click", () => {
        this.debugFillBoard();
      });

    document.getElementById("debug-add-2048")?.addEventListener("click", () => {
      this.debugAdd2048Tile();
    });

    console.log("🐛 Debug panel loaded - Development mode only");
  }

  private debugTriggerGameOver(): void {
    console.log("🐛 Debug: Triggering Game Over");

    // Fill the board with non-mergeable tiles
    const values = [
      2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2, 4, 8, 16, 32, 64,
    ];
    let valueIndex = 0;

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.game.board[row][col]) {
          this.game.removeTile(this.game.board[row][col]!);
        }

        const value = values[valueIndex % values.length];
        const tileObj = this.game.createTileObject(value, row, col);
        this.game.board[row][col] = tileObj;
        valueIndex++;
      }
    }

    this.game.gameOver = true;
    this.game.updateScore();
    this.game.checkGameState();
  }

  private debugTriggerWin(targetValue: GameMode): void {
    console.log(`🐛 Debug: Triggering Win with ${targetValue} tile`);

    // Clear existing tile in top-left corner
    if (this.game.board[0][0]) {
      this.game.removeTile(this.game.board[0][0]!);
    }

    // Add the target tile
    const winTile = this.game.createTileObject(targetValue, 0, 0);
    this.game.board[0][0] = winTile;

    // Update score to match achievement
    this.game.score += targetValue;

    // Set current target to match the tile
    const levelIndex = this.game.achievementLevels.indexOf(targetValue);
    if (levelIndex !== -1) {
      this.game.currentTargetLevel = levelIndex;
    }

    this.game.checkGameState();
  }

  private debugFillBoard(): void {
    console.log("🐛 Debug: Filling board with random tiles");

    const values = [2, 4, 8, 16, 32, 64];

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.game.board[row][col]) {
          this.game.removeTile(this.game.board[row][col]!);
        }

        const randomValue = values[Math.floor(Math.random() * values.length)];
        const tileObj = this.game.createTileObject(randomValue, row, col);
        this.game.board[row][col] = tileObj;
      }
    }

    this.game.updateScore();
  }

  private debugAdd2048Tile(): void {
    console.log("🐛 Debug: Adding 2048 tile");

    // Find an empty spot or use top-left corner
    let targetRow = 0;
    let targetCol = 0;

    // Try to find an empty spot
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.game.board[row][col] === null) {
          targetRow = row;
          targetCol = col;
          break;
        }
      }
    }

    // Clear existing tile if necessary
    if (this.game.board[targetRow][targetCol]) {
      this.game.removeTile(this.game.board[targetRow][targetCol]!);
    }

    // Add 2048 tile
    const tile2048 = this.game.createTileObject(2048, targetRow, targetCol);
    this.game.board[targetRow][targetCol] = tile2048;

    this.game.updateScore();
  }
}
