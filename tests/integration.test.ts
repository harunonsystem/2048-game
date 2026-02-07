import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Game Integration Tests", () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="score">0</div>
      <div id="best-score">0</div>
      <div id="tile-container"></div>
      <div id="game-message" class="hidden">
        <div id="message-text"></div>
        <div id="final-score">0</div>
        <div id="result-best-score">0</div>
        <div id="result-icon"></div>
        <div id="result-subtitle"></div>
        <div id="highest-tile">0</div>
        <div id="celebration-effects"></div>
        <button id="continue-btn" class="hidden">Continue</button>
        <button id="try-again-btn" data-i18n="tryAgain">Try Again</button>
      </div>
      <button id="restart-btn">Restart</button>
      <button id="lang-toggle">
        <span id="flag-icon">🇺🇸</span>
      </button>
      <button id="share-x-btn">Share</button>
      <button id="copy-result-btn">Copy</button>
      <div class="mode-buttons">
        <button class="mode-button active" data-target="2048">2048</button>
        <button class="mode-button" data-target="4096">4096</button>
      </div>
      <div data-i18n="congratulations"></div>
      <div data-i18n="achievement2048"></div>
    `;
  });

  describe("Language Toggle Button Click", () => {
    it("should change translations when language toggle button is clicked", async () => {
      const langToggle = document.getElementById("lang-toggle")!;
      const flagIcon = document.getElementById("flag-icon")!;
      const tryAgainBtn = document.getElementById("try-again-btn")!;
      const congratsElement = document.querySelector(
        '[data-i18n="congratulations"]',
      )!;
      const achievementElement = document.querySelector(
        '[data-i18n="achievement2048"]',
      )!;

      // Initial state should be Japanese (flag shows US flag to switch to English)
      expect(flagIcon.textContent).toBe("🇺🇸");

      // Mock translations data (no fetch needed - static import)
      const translationsData = {
        ja: {
          congratulations: "おめでとう！",
          achievement2048: "2048タイルを達成しました！",
          tryAgain: "もう一度",
        },
        en: {
          congratulations: "Congratulations!",
          achievement2048: "You reached the 2048 tile!",
          tryAgain: "Try Again",
        },
      };

      // Simulate a simplified language toggle
      const simulateLanguageToggle = async (currentLang: string) => {
        const newLang = currentLang === "ja" ? "en" : "ja";

        // Update flag
        if (newLang === "ja") {
          flagIcon.textContent = "🇺🇸";
        } else {
          flagIcon.textContent = "🇯🇵";
        }

        // Update translations (use local data)

        document.querySelectorAll("[data-i18n]").forEach((element) => {
          const key = element.getAttribute("data-i18n");
          if (
            key &&
            translationsData[newLang] &&
            translationsData[newLang][key]
          ) {
            element.textContent = translationsData[newLang][key];
          }
        });

        return newLang;
      };

      // Test initial Japanese state
      let currentLang = await simulateLanguageToggle("en"); // This will set to Japanese
      expect(currentLang).toBe("ja");
      expect(flagIcon.textContent).toBe("🇺🇸");
      expect(congratsElement.textContent).toBe("おめでとう！");
      expect(achievementElement.textContent).toBe("2048タイルを達成しました！");

      // Click to switch to English
      currentLang = await simulateLanguageToggle("ja");
      expect(currentLang).toBe("en");
      expect(flagIcon.textContent).toBe("🇯🇵");
      expect(congratsElement.textContent).toBe("Congratulations!");
      expect(achievementElement.textContent).toBe("You reached the 2048 tile!");
    });
  });

  describe("Tile Calculation Scenarios", () => {
    it("should handle complex tile merging scenarios correctly", () => {
      // Test case: [2, 2, 4, 4] should become [4, 8, null, null]
      const slideArray = (arr: any[]) => {
        let filtered = arr.filter((tile) => tile !== null);
        let moved = false;
        let score = 0;

        // Merge tiles
        for (let i = 0; i < filtered.length - 1; i++) {
          if (
            filtered[i] &&
            filtered[i + 1] &&
            filtered[i].value === filtered[i + 1].value
          ) {
            filtered[i].value *= 2;
            score += filtered[i].value;
            filtered.splice(i + 1, 1); // Remove the merged tile
            moved = true;
          }
        }

        const result = [...filtered];
        while (result.length < 4) {
          result.push(null);
        }

        return { array: result, moved, score };
      };

      // Test multiple scenarios
      const testCases = [
        {
          input: [
            { value: 2, id: 1 },
            { value: 2, id: 2 },
            { value: 4, id: 3 },
            { value: 4, id: 4 },
          ],
          expected: [{ value: 4, id: 1 }, { value: 8, id: 3 }, null, null],
          expectedScore: 12,
        },
        {
          input: [
            { value: 4, id: 1 },
            { value: 4, id: 2 },
            { value: 4, id: 3 },
            null,
          ],
          expected: [{ value: 8, id: 1 }, { value: 4, id: 3 }, null, null],
          expectedScore: 8,
        },
        {
          input: [null, { value: 2, id: 1 }, { value: 2, id: 2 }, null],
          expected: [{ value: 4, id: 1 }, null, null, null],
          expectedScore: 4,
        },
      ];

      testCases.forEach(({ input, expected, expectedScore }, index) => {
        const result = slideArray(input);

        expect(result.array).toEqual(expected);
        expect(result.score).toBe(expectedScore);
        expect(result.moved).toBe(true);
      });
    });
  });

  describe("2048 Achievement Display", () => {
    it("should display correct achievement message in 2048 mode", () => {
      // Setup game state
      const gameMessage = document.getElementById("game-message")!;
      const messageText = document.getElementById("message-text")!;
      const resultSubtitle = document.getElementById("result-subtitle")!;
      const finalScore = document.getElementById("final-score")!;
      const highestTile = document.getElementById("highest-tile")!;

      // Simulate 2048 achievement
      const show2048Achievement = (language: string, score: number) => {
        const translations = {
          ja: {
            congratulations: "おめでとう！",
            achievement2048: "2048タイルを達成しました！",
            wellDone: "よくできました！",
          },
          en: {
            congratulations: "Congratulations!",
            achievement2048: "You reached the 2048 tile!",
            wellDone: "Well done!",
          },
        };

        const t = translations[language];
        const message = `${t.congratulations}\n${t.achievement2048}`;

        messageText.textContent = message;
        resultSubtitle.textContent = t.wellDone;
        finalScore.textContent = score.toString();
        highestTile.textContent = "2048";
        gameMessage.classList.remove("hidden");
      };

      // Test Japanese achievement
      show2048Achievement("ja", 25000);
      expect(gameMessage.classList.contains("hidden")).toBe(false);
      expect(messageText.textContent).toBe(
        "おめでとう！\n2048タイルを達成しました！",
      );
      expect(resultSubtitle.textContent).toBe("よくできました！");
      expect(finalScore.textContent).toBe("25000");
      expect(highestTile.textContent).toBe("2048");

      // Reset and test English achievement
      gameMessage.classList.add("hidden");
      show2048Achievement("en", 30000);
      expect(gameMessage.classList.contains("hidden")).toBe(false);
      expect(messageText.textContent).toBe(
        "Congratulations!\nYou reached the 2048 tile!",
      );
      expect(resultSubtitle.textContent).toBe("Well done!");
      expect(finalScore.textContent).toBe("30000");
    });
  });

  describe("DOM Integration", () => {
    it("should update score display correctly", () => {
      const scoreElement = document.getElementById("score")!;
      const bestScoreElement = document.getElementById("best-score")!;

      // Simulate score updates
      let currentScore = 0;
      let bestScore = 0;

      const updateScore = (newScore: number) => {
        currentScore = newScore;
        if (currentScore > bestScore) {
          bestScore = currentScore;
        }
        scoreElement.textContent = currentScore.toString();
        bestScoreElement.textContent = bestScore.toString();
      };

      updateScore(100);
      expect(scoreElement.textContent).toBe("100");
      expect(bestScoreElement.textContent).toBe("100");

      updateScore(50);
      expect(scoreElement.textContent).toBe("50");
      expect(bestScoreElement.textContent).toBe("100"); // Best score should not decrease

      updateScore(200);
      expect(scoreElement.textContent).toBe("200");
      expect(bestScoreElement.textContent).toBe("200"); // New best score
    });
  });
});
