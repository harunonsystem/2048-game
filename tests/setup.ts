// Test setup for Vitest
import { beforeEach, vi } from "vitest";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock DOM methods
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.open for social sharing
Object.defineProperty(window, "open", {
  value: vi.fn(),
});

// Mock navigator.clipboard
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();

  // Reset localStorage mock
  localStorageMock.getItem.mockReturnValue(null);

  // Setup DOM
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
      <button id="try-again-btn">Try Again</button>
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
  `;
});
