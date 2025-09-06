/**
 * Debug functionality tests
 * Tests for development-only debug controls and game manipulation
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { DebugManager } from "../src/debug";

// Create a mock Game2048 instance for testing
class MockGame2048 {
  public board: Array<Array<any | null>> = Array(4)
    .fill(null)
    .map(() => Array(4).fill(null));
  public score: number = 0;
  public gameOver: boolean = false;
  public achievementLevels: number[] = [2048, 4096, 8192, 16384];
  public currentTargetLevel: number = 0;

  public createTileObject(value: number, row: number, col: number) {
    return {
      value,
      row,
      col,
      id: `tile-${row}-${col}-${Date.now()}`,
      element: document.createElement("div"),
    };
  }

  public removeTile(tile: any): void {
    // Mock tile removal
    if (tile?.element?.parentNode) {
      tile.element.parentNode.removeChild(tile.element);
    }
  }

  public updateScore(): void {
    // Mock score update - calculate from board
    this.score = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.board[row][col]) {
          this.score += this.board[row][col].value;
        }
      }
    }
  }

  public checkGameState(): void {
    // Mock game state checking
    console.log("Game state checked");
  }
}

// Mock DebugManager that allows us to control production environment
class TestDebugManager extends DebugManager {
  private isProd: boolean = false;

  public setProdMode(isProd: boolean): void {
    this.isProd = isProd;
  }

  public setupDebugControls(): void {
    // Use our controlled production flag instead of import.meta.env.PROD
    if (this.isProd) {
      return;
    }

    // Create debug panel dynamically (copied from original)
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
      this["debugTriggerGameOver"]();
    });

    document.getElementById("debug-win-2048")?.addEventListener("click", () => {
      this["debugTriggerWin"](2048);
    });

    document.getElementById("debug-win-4096")?.addEventListener("click", () => {
      this["debugTriggerWin"](4096);
    });

    document
      .getElementById("debug-fill-board")
      ?.addEventListener("click", () => {
        this["debugFillBoard"]();
      });

    document.getElementById("debug-add-2048")?.addEventListener("click", () => {
      this["debugAdd2048Tile"]();
    });

    console.log("🐛 Debug panel loaded - Development mode only");
  }
}

describe("DebugManager", () => {
  let debugManager: TestDebugManager;
  let mockGame: MockGame2048;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = "";

    // Setup mock game
    mockGame = new MockGame2048();
    debugManager = new TestDebugManager(mockGame);

    // Mock console.log to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("Constructor", () => {
    it("should initialize with game instance", () => {
      expect(debugManager).toBeDefined();
      expect(debugManager["game"]).toBe(mockGame);
    });
  });

  describe("setupDebugControls", () => {
    it("should not create debug panel in production", () => {
      debugManager.setProdMode(true);
      debugManager.setupDebugControls();

      expect(document.getElementById("debug-panel")).toBeNull();
    });

    it("should create debug panel in development", () => {
      debugManager.setProdMode(false);
      debugManager.setupDebugControls();

      const debugPanel = document.getElementById("debug-panel");
      expect(debugPanel).toBeTruthy();
      expect(debugPanel?.classList.contains("debug-panel")).toBe(true);
    });

    it("should create debug panel with correct buttons", () => {
      debugManager.setupDebugControls();

      expect(document.getElementById("debug-gameover")).toBeTruthy();
      expect(document.getElementById("debug-win-2048")).toBeTruthy();
      expect(document.getElementById("debug-win-4096")).toBeTruthy();
      expect(document.getElementById("debug-fill-board")).toBeTruthy();
      expect(document.getElementById("debug-add-2048")).toBeTruthy();
    });

    it("should setup event listeners for debug buttons", () => {
      // Spy on private methods
      const gameOverSpy = vi.spyOn(debugManager as any, "debugTriggerGameOver");
      const winSpy = vi.spyOn(debugManager as any, "debugTriggerWin");
      const fillBoardSpy = vi.spyOn(debugManager as any, "debugFillBoard");
      const add2048Spy = vi.spyOn(debugManager as any, "debugAdd2048Tile");

      debugManager.setupDebugControls();

      // Simulate button clicks
      document.getElementById("debug-gameover")?.click();
      expect(gameOverSpy).toHaveBeenCalled();

      document.getElementById("debug-win-2048")?.click();
      expect(winSpy).toHaveBeenCalledWith(2048);

      document.getElementById("debug-win-4096")?.click();
      expect(winSpy).toHaveBeenCalledWith(4096);

      document.getElementById("debug-fill-board")?.click();
      expect(fillBoardSpy).toHaveBeenCalled();

      document.getElementById("debug-add-2048")?.click();
      expect(add2048Spy).toHaveBeenCalled();
    });
  });

  describe("debugTriggerGameOver", () => {
    it("should fill board with non-mergeable tiles", () => {
      debugManager["debugTriggerGameOver"]();

      // Check that all board positions are filled
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          expect(mockGame.board[row][col]).toBeTruthy();
          expect(mockGame.board[row][col].value).toBeGreaterThan(0);
        }
      }
    });

    it("should set gameOver to true", () => {
      debugManager["debugTriggerGameOver"]();
      expect(mockGame.gameOver).toBe(true);
    });

    it("should call updateScore and checkGameState", () => {
      const updateScoreSpy = vi.spyOn(mockGame, "updateScore");
      const checkGameStateSpy = vi.spyOn(mockGame, "checkGameState");

      debugManager["debugTriggerGameOver"]();

      expect(updateScoreSpy).toHaveBeenCalled();
      expect(checkGameStateSpy).toHaveBeenCalled();
    });
  });

  describe("debugTriggerWin", () => {
    it("should create winning tile with correct value", () => {
      debugManager["debugTriggerWin"](2048);

      const winTile = mockGame.board[0][0];
      expect(winTile).toBeTruthy();
      expect(winTile.value).toBe(2048);
      expect(winTile.row).toBe(0);
      expect(winTile.col).toBe(0);
    });

    it("should update score with target value", () => {
      const initialScore = mockGame.score;
      debugManager["debugTriggerWin"](4096);

      expect(mockGame.score).toBe(initialScore + 4096);
    });

    it("should set current target level correctly", () => {
      debugManager["debugTriggerWin"](4096);

      const expectedLevel = mockGame.achievementLevels.indexOf(4096);
      expect(mockGame.currentTargetLevel).toBe(expectedLevel);
    });

    it("should call checkGameState", () => {
      const checkGameStateSpy = vi.spyOn(mockGame, "checkGameState");

      debugManager["debugTriggerWin"](2048);

      expect(checkGameStateSpy).toHaveBeenCalled();
    });

    it("should remove existing tile before creating win tile", () => {
      // Place a tile at [0][0]
      mockGame.board[0][0] = mockGame.createTileObject(64, 0, 0);
      const removeTileSpy = vi.spyOn(mockGame, "removeTile");

      debugManager["debugTriggerWin"](2048);

      expect(removeTileSpy).toHaveBeenCalled();
    });
  });

  describe("debugFillBoard", () => {
    it("should fill all board positions", () => {
      debugManager["debugFillBoard"]();

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          expect(mockGame.board[row][col]).toBeTruthy();
        }
      }
    });

    it("should use valid tile values", () => {
      const validValues = [2, 4, 8, 16, 32, 64];

      debugManager["debugFillBoard"]();

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const tileValue = mockGame.board[row][col].value;
          expect(validValues).toContain(tileValue);
        }
      }
    });

    it("should remove existing tiles before filling", () => {
      // Pre-fill some tiles
      mockGame.board[1][1] = mockGame.createTileObject(128, 1, 1);
      mockGame.board[2][2] = mockGame.createTileObject(256, 2, 2);

      const removeTileSpy = vi.spyOn(mockGame, "removeTile");

      debugManager["debugFillBoard"]();

      // The debugFillBoard method calls removeTile for each position (16 total)
      expect(removeTileSpy).toHaveBeenCalled();
    });

    it("should call updateScore", () => {
      const updateScoreSpy = vi.spyOn(mockGame, "updateScore");

      debugManager["debugFillBoard"]();

      expect(updateScoreSpy).toHaveBeenCalled();
    });
  });

  describe("debugAdd2048Tile", () => {
    it("should add 2048 tile to empty position", () => {
      // Ensure board is empty
      mockGame.board = Array(4)
        .fill(null)
        .map(() => Array(4).fill(null));

      debugManager["debugAdd2048Tile"]();

      // Should find the tile on the board
      let found2048Tile = false;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (mockGame.board[row][col]?.value === 2048) {
            found2048Tile = true;
            break;
          }
        }
      }
      expect(found2048Tile).toBe(true);
    });

    it("should prefer empty positions over occupied ones", () => {
      // Fill board except one position
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (row !== 3 || col !== 3) {
            mockGame.board[row][col] = mockGame.createTileObject(64, row, col);
          }
        }
      }

      debugManager["debugAdd2048Tile"]();

      // Should place tile at the empty position [3][3]
      expect(mockGame.board[3][3]?.value).toBe(2048);
    });

    it("should replace tile at [0][0] if board is full", () => {
      // Fill the entire board
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          mockGame.board[row][col] = mockGame.createTileObject(32, row, col);
        }
      }

      const removeTileSpy = vi.spyOn(mockGame, "removeTile");

      debugManager["debugAdd2048Tile"]();

      expect(removeTileSpy).toHaveBeenCalled();
      expect(mockGame.board[0][0]?.value).toBe(2048);
    });

    it("should call updateScore", () => {
      const updateScoreSpy = vi.spyOn(mockGame, "updateScore");

      debugManager["debugAdd2048Tile"]();

      expect(updateScoreSpy).toHaveBeenCalled();
    });
  });

  describe("Integration with DOM", () => {
    it("should create proper HTML structure for debug panel", () => {
      debugManager.setupDebugControls();

      const debugPanel = document.getElementById("debug-panel");
      expect(debugPanel).toBeTruthy();

      // Check for header
      const header = debugPanel?.querySelector("h3");
      expect(header?.textContent).toBe("🐛 Debug Controls");

      // Check for button container
      const buttonContainer = debugPanel?.querySelector(".debug-buttons");
      expect(buttonContainer).toBeTruthy();

      // Check all buttons exist
      const buttons = buttonContainer?.querySelectorAll(".debug-btn");
      expect(buttons?.length).toBe(5);
    });

    it("should append debug panel to document body", () => {
      debugManager.setupDebugControls();

      const debugPanel = document.getElementById("debug-panel");
      expect(debugPanel?.parentNode).toBe(document.body);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing DOM elements gracefully", () => {
      // Mock scenario where buttons don't exist
      const originalGetElementById = document.getElementById;
      document.getElementById = vi.fn().mockReturnValue(null);

      expect(() => {
        debugManager.setupDebugControls();
      }).not.toThrow();

      // Restore original method
      document.getElementById = originalGetElementById;
    });

    it("should handle invalid game state gracefully", () => {
      // Test with null board positions
      mockGame.board[0][0] = null;

      expect(() => {
        debugManager["debugTriggerGameOver"]();
        debugManager["debugTriggerWin"](2048);
        debugManager["debugFillBoard"]();
        debugManager["debugAdd2048Tile"]();
      }).not.toThrow();
    });
  });
});
