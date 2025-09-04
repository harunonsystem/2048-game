// 翻訳データ
const translations = {
  ja: {
    score: "スコア",
    best: "ベスト",
    howToPlay: "遊び方：",
    instructions:
      "矢印キーを使ってタイルを動かし、同じ数字のタイルを合成して2048を目指しましょう！",
    newGame: "新しいゲーム",
    tryAgain: "もう一度",
    continueGame: "続ける",
    finalScore: "最終スコア",
    bestScore: "ベストスコア",
    highestTile: "最高タイル",
    shareResult: "結果をシェア",
    congratulations: "おめでとうございます！",
    achievement2048: "2048達成！",
    achievement4096: "4096達成！素晴らしい！",
    achievement8192: "8192達成！驚異的です！",
    achievement16384: "16384達成！信じられません！",
    achievement32768: "32768達成！伝説級です！",
    achievement65536: "65536達成！神の領域です！",
    keepGoing: "まだまだ続けられます！",
    gameOver: "ゲームオーバー",
    noMovesLeft: "動かせるタイルがありません",
    newRecord: "新記録！",
    wellDone: "よくできました！",
  },
  en: {
    score: "Score",
    best: "Best",
    howToPlay: "How to Play:",
    instructions:
      "Use arrow keys to move tiles. Combine tiles with the same number to reach 2048!",
    newGame: "New Game",
    tryAgain: "Try Again",
    continueGame: "Continue",
    finalScore: "Final Score",
    bestScore: "Best Score",
    highestTile: "Highest Tile",
    shareResult: "Share Result",
    congratulations: "Congratulations!",
    achievement2048: "You reached 2048!",
    achievement4096: "You reached 4096! Amazing!",
    achievement8192: "You reached 8192! Incredible!",
    achievement16384: "You reached 16384! Unbelievable!",
    achievement32768: "You reached 32768! Legendary!",
    achievement65536: "You reached 65536! Godlike!",
    keepGoing: "Keep going for higher scores!",
    gameOver: "Game Over",
    noMovesLeft: "No moves available",
    newRecord: "New Record!",
    wellDone: "Well Done!",
  },
};

class Game2048 {
  constructor() {
    // 各セルにタイルオブジェクトを持つ（0 または {id, value}）
    this.board = Array(4)
      .fill()
      .map(() => Array(4).fill(null));
    this.score = 0;
    this.bestScore = this.loadBestScore();
    this.gameWon = false;
    this.gameOver = false;
    this.tileElements = new Map(); // id -> DOM要素のマッピング
    this.tileIdCounter = 0;
    this.currentLanguage = this.loadLanguage();

    // Configurable achievement levels
    this.achievementLevels = [2048, 4096, 8192, 16384, 32768, 65536];
    this.currentTargetLevel = this.loadGameMode(); // Index of current target level
    this.completedLevels = new Set(); // Track completed levels

    this.scoreElement = document.getElementById("score");
    this.bestScoreElement = document.getElementById("best-score");
    this.tileContainer = document.getElementById("tile-container");
    this.gameMessage = document.getElementById("game-message");
    this.messageText = document.getElementById("message-text");
    this.finalScoreElement = document.getElementById("final-score");
    this.resultBestScoreElement = document.getElementById("result-best-score");
    this.resultIcon = document.getElementById("result-icon");
    this.resultSubtitle = document.getElementById("result-subtitle");
    this.highestTileElement = document.getElementById("highest-tile");
    this.celebrationEffects = document.getElementById("celebration-effects");
    this.continueButton = document.getElementById("continue-btn");
    this.shareXButton = document.getElementById("share-x-btn");
    this.copyResultButton = document.getElementById("copy-result-btn");

    this.init();
  }

  init() {
    this.updateScore();
    this.addRandomTile();
    this.addRandomTile();
    this.setupEventListeners();
    this.applyTranslations();
    this.updateModeButtons();
  }

  loadLanguage() {
    return localStorage.getItem("2048-language") || "ja";
  }

  saveLanguage() {
    localStorage.setItem("2048-language", this.currentLanguage);
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === "ja" ? "en" : "ja";
    this.saveLanguage();
    this.applyTranslations();
    this.updateLanguageButton();
  }

  updateLanguageButton() {
    const flagIcon = document.getElementById("flag-icon");
    const langButton = document.getElementById("lang-toggle");

    // 切り替え先の言語と国旗を表示
    if (this.currentLanguage === "ja") {
      // 現在日本語 → 英語に切り替える
      flagIcon.textContent = "🇺🇸";
      langButton.title = "Switch to English";
    } else {
      // 現在英語 → 日本語に切り替える
      flagIcon.textContent = "🇯🇵";
      langButton.title = "Switch to Japanese";
    }
  }

  applyTranslations() {
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (
        translations[this.currentLanguage] &&
        translations[this.currentLanguage][key]
      ) {
        element.textContent = translations[this.currentLanguage][key];
      }
    });
    this.updateLanguageButton();
  }

  setupEventListeners() {
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
    document
      .getElementById("restart-btn")
      .addEventListener("click", () => this.restart());
    document
      .getElementById("try-again-btn")
      .addEventListener("click", () => this.restart());
    document
      .getElementById("lang-toggle")
      .addEventListener("click", () => this.toggleLanguage());

    // シェア機能のイベントリスナー
    this.shareXButton.addEventListener("click", () => this.shareToX());
    this.copyResultButton.addEventListener("click", () => this.copyResult());
    this.continueButton.addEventListener("click", () => this.continueGame());

    // ゲームモード選択のイベントリスナー
    document.querySelectorAll(".mode-button").forEach((button) => {
      button.addEventListener("click", () => this.changeGameMode(button));
    });

    // タッチイベント（モバイル対応）
    let startX, startY;
    document.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    document.addEventListener("touchend", (e) => {
      if (!startX || !startY) return;

      let endX = e.changedTouches[0].clientX;
      let endY = e.changedTouches[0].clientY;

      let diffX = startX - endX;
      let diffY = startY - endY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 30) this.move("left");
        else if (diffX < -30) this.move("right");
      } else {
        if (diffY > 30) this.move("up");
        else if (diffY < -30) this.move("down");
      }

      startX = startY = null;
    });
  }

  handleKeyPress(e) {
    if (this.gameOver && !["KeyR", "Space"].includes(e.code)) return;

    switch (e.code) {
      case "ArrowLeft":
      case "KeyA":
        e.preventDefault();
        this.move("left");
        break;
      case "ArrowRight":
      case "KeyD":
        e.preventDefault();
        this.move("right");
        break;
      case "ArrowUp":
      case "KeyW":
        e.preventDefault();
        this.move("up");
        break;
      case "ArrowDown":
      case "KeyS":
        e.preventDefault();
        this.move("down");
        break;
      case "KeyR":
      case "Space":
        e.preventDefault();
        this.restart();
        break;
    }
  }

  move(direction) {
    if (this.gameOver) return;

    let moved = false;
    let newBoard = this.board.map((row) => [...row]);

    switch (direction) {
      case "left":
        moved = this.moveLeft(newBoard);
        break;
      case "right":
        moved = this.moveRight(newBoard);
        break;
      case "up":
        moved = this.moveUp(newBoard);
        break;
      case "down":
        moved = this.moveDown(newBoard);
        break;
    }

    if (moved) {
      this.board = newBoard;
      this.addRandomTile();
      this.updateDisplay();
      this.checkGameState();
    }
  }

  moveLeft(board) {
    let moved = false;
    for (let row = 0; row < 4; row++) {
      let newRow = this.slideArray(board[row]);
      if (newRow.moved) moved = true;
      board[row] = newRow.array;
    }
    return moved;
  }

  moveRight(board) {
    let moved = false;
    for (let row = 0; row < 4; row++) {
      let reversed = board[row].slice().reverse();
      let newRow = this.slideArray(reversed);
      if (newRow.moved) moved = true;
      board[row] = newRow.array.reverse();
    }
    return moved;
  }

  moveUp(board) {
    let moved = false;
    for (let col = 0; col < 4; col++) {
      let column = [board[0][col], board[1][col], board[2][col], board[3][col]];
      let newCol = this.slideArray(column);
      if (newCol.moved) moved = true;
      for (let row = 0; row < 4; row++) {
        board[row][col] = newCol.array[row];
      }
    }
    return moved;
  }

  moveDown(board) {
    let moved = false;
    for (let col = 0; col < 4; col++) {
      let column = [board[3][col], board[2][col], board[1][col], board[0][col]];
      let newCol = this.slideArray(column);
      if (newCol.moved) moved = true;
      for (let row = 0; row < 4; row++) {
        board[3 - row][col] = newCol.array[row];
      }
    }
    return moved;
  }

  slideArray(arr) {
    let filtered = arr.filter((tile) => tile !== null);
    let moved = false;

    for (let i = 0; i < filtered.length - 1; i++) {
      if (
        filtered[i] &&
        filtered[i + 1] &&
        filtered[i].value === filtered[i + 1].value
      ) {
        // マージ: 値を倍にしてタイルを削除
        filtered[i].value *= 2;
        this.score += filtered[i].value;

        // マージされるタイルを削除
        this.removeTile(filtered[i + 1]);
        filtered[i + 1] = null;
        moved = true;

        // マージエフェクトをCSSで表現
        const element = this.tileElements.get(filtered[i].id);
        if (element) {
          element.className = `tile tile-${filtered[i].value}`;
          if (filtered[i].value > 2048) {
            element.classList.add("super");
          }
          element.textContent = filtered[i].value;
          element.classList.add("tile-merged");
        }
      }
    }

    filtered = filtered.filter((tile) => tile !== null);

    while (filtered.length < 4) {
      filtered.push(null);
    }

    // 配列が変化した場合はmoved=true
    const originalValues = arr.map((tile) => (tile ? tile.value : null));
    const newValues = filtered.map((tile) => (tile ? tile.value : null));
    if (JSON.stringify(originalValues) !== JSON.stringify(newValues)) {
      moved = true;
    }

    return { array: filtered, moved };
  }

  addRandomTile() {
    let emptyCells = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.board[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length > 0) {
      let randomCell =
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

  updateDisplay() {
    // 新しい差分更新システム - チカチカしない！
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const tile = this.board[row][col];
        if (tile) {
          // タイルが新しい位置にある場合のみ移動アニメーション
          if (tile.row !== row || tile.col !== col) {
            this.moveTile(tile, row, col);
          }
        }
      }
    }
  }

  createTileObject(value, row, col) {
    const id = ++this.tileIdCounter;
    const tileObj = { id, value, row, col };

    // DOM要素を作成
    const element = document.createElement("div");
    element.className = `tile tile-${value}`;
    element.setAttribute("data-tile-id", id);

    if (value > 2048) {
      element.classList.add("super");
    }

    element.textContent = value;
    this.positionTile(element, row, col);

    this.tileElements.set(id, element);
    this.tileContainer.appendChild(element);

    return tileObj;
  }

  positionTile(element, row, col) {
    const cellSize = (100 - 7.5) / 4;
    const gap = 2.5;
    element.style.left = `${col * (cellSize + gap)}%`;
    element.style.top = `${row * (cellSize + gap)}%`;
  }

  moveTile(tileObj, newRow, newCol) {
    const element = this.tileElements.get(tileObj.id);
    if (element) {
      this.positionTile(element, newRow, newCol);
      tileObj.row = newRow;
      tileObj.col = newCol;
    }
  }

  removeTile(tileObj) {
    const element = this.tileElements.get(tileObj.id);
    if (element) {
      element.remove();
      this.tileElements.delete(tileObj.id);
    }
  }

  updateScore() {
    this.scoreElement.textContent = this.score;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.saveBestScore();
    }

    this.bestScoreElement.textContent = this.bestScore;
  }

  checkGameState() {
    this.updateScore();

    // Achievement level checks
    if (!this.gameWon) {
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const tile = this.board[row][col];
          if (tile) {
            // Check for new achievement levels
            for (let i = 0; i < this.achievementLevels.length; i++) {
              const level = this.achievementLevels[i];
              if (tile.value >= level && !this.completedLevels.has(level)) {
                this.completedLevels.add(level);

                // Check if this is the final win condition
                if (i >= this.currentTargetLevel) {
                  this.gameWon = true;
                  this.currentTargetLevel = Math.max(
                    this.currentTargetLevel,
                    i + 1,
                  );
                }

                const t = translations[this.currentLanguage];
                const isNewRecord = this.score > this.bestScore;
                const congratsMsg = t.congratulations;
                const achievementKey = `achievement${level}`;
                const achievementMsg =
                  t[achievementKey] || t.achievement2048.replace("2048", level);
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

                if (this.gameWon) return;
              }
            }
          }
        }
      }
    }

    // ゲームオーバーチェック
    if (this.isGameOver()) {
      this.gameOver = true;
      const t = translations[this.currentLanguage];
      const gameOverMsg = t.gameOver;
      const noMovesMsg = t.noMovesLeft;

      // スコアに応じてサブタイトルを変更
      let subtitle = "";
      if (this.score > this.bestScore * 0.8) {
        subtitle = t.wellDone;
      }

      this.showMessage(`${gameOverMsg}\n${noMovesMsg}`, false, subtitle);
    }
  }

  isGameOver() {
    // 空きセルがあるかチェック
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.board[row][col] === null) {
          return false;
        }
      }
    }

    // 縦横に隣接する同じ値のタイルがあるかチェック
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        let current = this.board[row][col];
        if (current) {
          if (
            (col < 3 &&
              this.board[row][col + 1] &&
              current.value === this.board[row][col + 1].value) ||
            (row < 3 &&
              this.board[row + 1][col] &&
              current.value === this.board[row + 1][col].value)
          ) {
            return false;
          }
        }
      }
    }

    return true;
  }

  getHighestTileValue() {
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

  showMessage(message, isWin = false, subtitle = "") {
    this.messageText.textContent = message;
    this.resultSubtitle.textContent = subtitle;

    // リザルト詳細を更新
    const highestTile = this.getHighestTileValue();
    this.finalScoreElement.textContent = this.score;
    this.resultBestScoreElement.textContent = this.bestScore;
    this.highestTileElement.textContent = highestTile;

    // アイコンとエフェクトを設定
    this.resultIcon.className = `result-icon ${isWin ? "win" : "lose"}`;
    this.celebrationEffects.className = `celebration-effects ${isWin ? "win" : ""}`;

    // ボタンの表示制御
    const tryAgainBtn = document.getElementById("try-again-btn");

    if (isWin && !this.gameOver) {
      // 勝利時：「続ける」ボタンを主要に、「新しいゲーム」は補助的に
      this.continueButton.classList.remove("hidden");
      tryAgainBtn.classList.add("secondary");
      tryAgainBtn.style.order = "2";
      // ボタンテキストを「新しいゲーム」に変更
      const newGameText = translations[this.currentLanguage].newGame;
      tryAgainBtn.setAttribute("data-i18n", "newGame");
      tryAgainBtn.textContent = newGameText;
    } else {
      // ゲームオーバー時：「もう一度」ボタンのみ
      this.continueButton.classList.add("hidden");
      tryAgainBtn.classList.remove("secondary");
      tryAgainBtn.style.order = "1";
      // ボタンテキストを「もう一度」に変更
      const tryAgainText = translations[this.currentLanguage].tryAgain;
      tryAgainBtn.setAttribute("data-i18n", "tryAgain");
      tryAgainBtn.textContent = tryAgainText;
    }

    // アニメーション効果でメッセージを表示
    this.gameMessage.classList.remove("hidden");
  }

  hideMessage() {
    this.gameMessage.classList.add("hidden");
  }

  continueGame() {
    this.gameWon = false; // 勝利フラグをリセットして継続
    this.hideMessage();
  }

  generateShareText() {
    const highestTile = this.getHighestTileValue();
    const isJapanese = this.currentLanguage === "ja";

    if (isJapanese) {
      return (
        `2048ゲームで${highestTile}タイルを達成！\n` +
        `スコア: ${this.score.toLocaleString()}\n` +
        `あなたも挑戦してみませんか？`
      );
    } else {
      return (
        `I reached ${highestTile} tile in 2048!\n` +
        `Score: ${this.score.toLocaleString()}\n` +
        `Try it yourself!`
      );
    }
  }

  shareToX() {
    const text = this.generateShareText();
    const url = encodeURIComponent(window.location.href);
    const tweetText = encodeURIComponent(text);
    const xUrl = `https://x.com/intent/tweet?text=${tweetText}&url=${url}`;
    window.open(xUrl, "_blank", "width=600,height=400");
  }

  async copyResult() {
    const text = this.generateShareText();
    try {
      await navigator.clipboard.writeText(text);

      // コピー成功のフィードバック
      const originalText = this.copyResultButton.innerHTML;
      this.copyResultButton.innerHTML = "✓";
      this.copyResultButton.style.background =
        "linear-gradient(135deg, #10b981, #059669)";

      setTimeout(() => {
        this.copyResultButton.innerHTML = originalText;
        this.copyResultButton.style.background = "";
      }, 2000);
    } catch (err) {
      console.log("コピーに失敗しました:", err);
      // フォールバック: テキストエリアを使用
      this.fallbackCopyText(text);
    }
  }

  fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.log("フォールバックコピーも失敗:", err);
    }
    document.body.removeChild(textArea);
  }

  restart() {
    // 既存のタイルをすべて削除
    this.tileElements.forEach((element) => element.remove());
    this.tileElements.clear();
    this.tileIdCounter = 0;

    this.board = Array(4)
      .fill()
      .map(() => Array(4).fill(null));
    this.score = 0;
    this.gameWon = false;
    this.gameOver = false;
    this.completedLevels.clear(); // Reset completed achievements
    this.hideMessage();
    this.updateScore();
    this.addRandomTile();
    this.addRandomTile();
  }

  loadBestScore() {
    return parseInt(localStorage.getItem("2048-best-score") || "0");
  }

  saveBestScore() {
    localStorage.setItem("2048-best-score", this.bestScore.toString());
  }

  loadGameMode() {
    const saved = localStorage.getItem("gameMode");
    return saved ? parseInt(saved) : 0; // デフォルトは2048モード (index 0)
  }

  saveGameMode() {
    localStorage.setItem("gameMode", this.currentTargetLevel.toString());
  }

  changeGameMode(button) {
    const targetValue = parseInt(button.dataset.target);
    const targetIndex = this.achievementLevels.indexOf(targetValue);

    if (targetIndex !== -1) {
      this.currentTargetLevel = targetIndex;
      this.saveGameMode();

      // ボタンのアクティブ状態を更新
      document
        .querySelectorAll(".mode-button")
        .forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // 新しいゲームを開始
      this.restart();
    }
  }

  updateModeButtons() {
    const targetValue = this.achievementLevels[this.currentTargetLevel];
    document.querySelectorAll(".mode-button").forEach((btn) => {
      btn.classList.remove("active");
      if (parseInt(btn.dataset.target) === targetValue) {
        btn.classList.add("active");
      }
    });
  }
}

// ゲーム開始
document.addEventListener("DOMContentLoaded", () => {
  new Game2048();
});
