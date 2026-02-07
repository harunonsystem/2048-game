import { test, expect } from './utils/BaseTest';

test.describe('2048 Game - Footer Links', () => {

  test('should display all footer links', async ({ gamePage }) => {
    await expect(gamePage.footerLinks).toBeVisible();
    await expect(gamePage.contactLink).toBeVisible();
    await expect(gamePage.sponsorLink).toBeVisible();
    await expect(gamePage.coffeeLink).toBeVisible();
  });

  test('should have correct link texts in Japanese', async ({ gamePage }) => {
    await expect(gamePage.contactLink).toHaveText('お問い合わせ');
    await expect(gamePage.sponsorLink).toHaveText('GitHub Sponsors');
    await expect(gamePage.coffeeLink).toHaveText('Buy me a coffee');
  });

  test('should have correct link texts in English', async ({ gamePage }) => {
    await gamePage.toggleLanguage();
    await expect(gamePage.contactLink).toHaveText('Contact');
    await expect(gamePage.sponsorLink).toHaveText('GitHub Sponsors');
    await expect(gamePage.coffeeLink).toHaveText('Buy me a coffee');
  });

  test('should have correct href attributes', async ({ gamePage }) => {
    await expect(gamePage.contactLink).toHaveAttribute('href', 'mailto:contact@harunon.club');
    await expect(gamePage.sponsorLink).toHaveAttribute('href', 'https://github.com/sponsors/harunonsystem');
    await expect(gamePage.coffeeLink).toHaveAttribute('href', 'https://www.buymeacoffee.com/harunonsystem');
  });

  test('should have correct target and rel attributes for external links', async ({ gamePage }) => {
    // Sponsor and coffee links should open in new tab
    await expect(gamePage.sponsorLink).toHaveAttribute('target', '_blank');
    await expect(gamePage.coffeeLink).toHaveAttribute('target', '_blank');
    
    // External links should have security attributes
    await expect(gamePage.sponsorLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(gamePage.coffeeLink).toHaveAttribute('rel', 'noopener noreferrer');
    
    // Contact link (mailto) should not have target=_blank
    await expect(gamePage.contactLink).not.toHaveAttribute('target', '_blank');
  });

  test('should have proper CSS classes and styling', async ({ gamePage }) => {
    await expect(gamePage.contactLink).toHaveClass(/footer-link/);
    await expect(gamePage.contactLink).toHaveClass(/contact-link/);
    await expect(gamePage.sponsorLink).toHaveClass(/footer-link/);
    await expect(gamePage.sponsorLink).toHaveClass(/github-sponsor-link/);
    await expect(gamePage.coffeeLink).toHaveClass(/footer-link/);
    await expect(gamePage.coffeeLink).toHaveClass(/coffee-link/);
  });

  test('should have visible dividers between links on desktop', async ({ gamePage, page }) => {
    // Check that dividers are present
    const dividers = page.locator('.footer-divider');
    await expect(dividers).toHaveCount(2);
    await expect(dividers.first()).toHaveText('|');
    await expect(dividers.last()).toHaveText('|');
  });

  test('should change color on hover', async ({ gamePage, page }) => {
    // Test hover states by checking computed styles
    const contactLinkColor = await gamePage.contactLink.evaluate((el) => {
      return getComputedStyle(el).color;
    });
    
    // Hover over contact link
    await gamePage.contactLink.hover();
    
    // Wait a bit for transition
    await page.waitForTimeout(100);
    
    const hoveredColor = await gamePage.contactLink.evaluate((el) => {
      return getComputedStyle(el).color;
    });
    
    // Colors should be different (initial gray vs hover blue)
    expect(contactLinkColor).not.toBe(hoveredColor);
  });

  test('footer should be positioned at bottom of page', async ({ page, gamePage }) => {
    await gamePage.goto();
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    
    // Check that footer is at the bottom
    const footerBox = await footer.boundingBox();
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    
    expect(footerBox).toBeTruthy();
    if (footerBox) {
      // Check footer is near bottom (within 100px)
      expect(Math.abs((footerBox.y + footerBox.height) - pageHeight)).toBeLessThan(100);
    }
  });
});