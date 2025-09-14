import { test as base } from '@playwright/test';
import { Game2048Page } from '../page-objects/Game2048Page';

export const test = base.extend<{ gamePage: Game2048Page }>({
  gamePage: async ({ page }, use) => {
    const gamePage = new Game2048Page(page);
    await gamePage.goto();
    await use(gamePage);
  },
});

export const mobileTest = base.extend<{ gamePage: Game2048Page }>({
  gamePage: async ({ page }, use) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const gamePage = new Game2048Page(page);
    await gamePage.goto();
    await use(gamePage);
  },
});

export { expect } from '@playwright/test';