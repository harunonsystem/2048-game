import { describe, it, expect, beforeEach } from "vitest";
import translationsData from "../src/translations.json";
import type { Language, Translations, Translation } from "../src/types";

// Mock translation manager for footer tests
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

describe("Footer Links", () => {
  let translationManager: MockTranslationManager;

  beforeEach(async () => {
    translationManager = new MockTranslationManager();
    await translationManager.loadTranslations();
    
    // Set up DOM elements for footer
    document.body.innerHTML = `
      <footer class="footer">
        <div class="footer-links">
          <a href="https://x.com/harunonsystem" target="_blank" rel="noopener noreferrer" 
             class="footer-link contact-link" data-i18n="contact">お問い合わせ</a>
          <span class="footer-divider">|</span>
          <a href="https://github.com/sponsors/harunonsystem" target="_blank" rel="noopener noreferrer"
             class="footer-link github-sponsor-link" data-i18n="githubSponsor">GitHub Sponsor</a>
          <span class="footer-divider">|</span>
          <a href="https://www.buymeacoffee.com/harunonsystem" target="_blank" rel="noopener noreferrer"
             class="footer-link coffee-link" data-i18n="buyMeCoffee">Buy me a coffee</a>
        </div>
      </footer>
    `;
  });

  describe("Footer Structure", () => {
    it("should have all required footer elements", () => {
      const footer = document.querySelector('.footer');
      const footerLinks = document.querySelector('.footer-links');
      const contactLink = document.querySelector('.contact-link');
      const sponsorLink = document.querySelector('.github-sponsor-link');
      const coffeeLink = document.querySelector('.coffee-link');
      const dividers = document.querySelectorAll('.footer-divider');

      expect(footer).toBeTruthy();
      expect(footerLinks).toBeTruthy();
      expect(contactLink).toBeTruthy();
      expect(sponsorLink).toBeTruthy();
      expect(coffeeLink).toBeTruthy();
      expect(dividers).toHaveLength(2);
    });

    it("should have correct href attributes", () => {
      const contactLink = document.querySelector('.contact-link') as HTMLAnchorElement;
      const sponsorLink = document.querySelector('.github-sponsor-link') as HTMLAnchorElement;
      const coffeeLink = document.querySelector('.coffee-link') as HTMLAnchorElement;

      expect(contactLink.href).toBe('https://x.com/harunonsystem');
      expect(sponsorLink.href).toBe('https://github.com/sponsors/harunonsystem');
      expect(coffeeLink.href).toBe('https://www.buymeacoffee.com/harunonsystem');
    });

    it("should have correct target and rel attributes", () => {
      const links = document.querySelectorAll('.footer-link') as NodeListOf<HTMLAnchorElement>;
      
      links.forEach(link => {
        expect(link.target).toBe('_blank');
        expect(link.rel).toBe('noopener noreferrer');
      });
    });

    it("should have correct CSS classes", () => {
      const contactLink = document.querySelector('.contact-link');
      const sponsorLink = document.querySelector('.github-sponsor-link');
      const coffeeLink = document.querySelector('.coffee-link');

      expect(contactLink?.classList.contains('footer-link')).toBe(true);
      expect(contactLink?.classList.contains('contact-link')).toBe(true);
      expect(sponsorLink?.classList.contains('footer-link')).toBe(true);
      expect(sponsorLink?.classList.contains('github-sponsor-link')).toBe(true);
      expect(coffeeLink?.classList.contains('footer-link')).toBe(true);
      expect(coffeeLink?.classList.contains('coffee-link')).toBe(true);
    });
  });

  describe("Footer Translations", () => {
    async function applyTranslations(language: Language): Promise<void> {
      const elements = document.querySelectorAll<HTMLElement>("[data-i18n]");
      elements.forEach((element) => {
        const key = element.getAttribute("data-i18n") as keyof Translation;
        if (key) {
          const translation = translationManager.getTranslation(language, key);
          element.textContent = translation;
        }
      });
    }

    it("should display correct Japanese text", async () => {
      await applyTranslations('ja');

      const contactLink = document.querySelector('.contact-link');
      const sponsorLink = document.querySelector('.github-sponsor-link');
      const coffeeLink = document.querySelector('.coffee-link');

      expect(contactLink?.textContent).toBe('お問い合わせ');
      expect(sponsorLink?.textContent).toBe('GitHub Sponsors');
      expect(coffeeLink?.textContent).toBe('Buy me a coffee');
    });

    it("should display correct English text", async () => {
      await applyTranslations('en');

      const contactLink = document.querySelector('.contact-link');
      const sponsorLink = document.querySelector('.github-sponsor-link');
      const coffeeLink = document.querySelector('.coffee-link');

      expect(contactLink?.textContent).toBe('Contact');
      expect(sponsorLink?.textContent).toBe('GitHub Sponsors');
      expect(coffeeLink?.textContent).toBe('Buy me a coffee');
    });

    it("should have correct translation keys in translations.json", () => {
      const jaTranslations = translationsData.ja;
      const enTranslations = translationsData.en;

      // Check Japanese translations
      expect(jaTranslations.contact).toBe('お問い合わせ');
      expect(jaTranslations.githubSponsor).toBe('GitHub Sponsors');
      expect(jaTranslations.buyMeCoffee).toBe('Buy me a coffee');

      // Check English translations
      expect(enTranslations.contact).toBe('Contact');
      expect(enTranslations.githubSponsor).toBe('GitHub Sponsors');
      expect(enTranslations.buyMeCoffee).toBe('Buy me a coffee');
    });
  });

  describe("Footer Accessibility", () => {
    it("should have proper accessibility attributes", () => {
      const links = document.querySelectorAll('.footer-link') as NodeListOf<HTMLAnchorElement>;
      
      links.forEach(link => {
        // Check that links have href
        expect(link.href).toBeTruthy();
        expect(link.href).toMatch(/^https?:\/\//);
        
        // Check external link security
        expect(link.target).toBe('_blank');
        expect(link.rel).toContain('noopener');
        expect(link.rel).toContain('noreferrer');
      });
    });

    it("should have descriptive text content", () => {
      const contactLink = document.querySelector('.contact-link');
      const sponsorLink = document.querySelector('.github-sponsor-link');
      const coffeeLink = document.querySelector('.coffee-link');

      expect(contactLink?.textContent).toBeTruthy();
      expect(sponsorLink?.textContent).toBeTruthy();
      expect(coffeeLink?.textContent).toBeTruthy();
      
      expect(contactLink?.textContent?.trim()).not.toBe('');
      expect(sponsorLink?.textContent?.trim()).not.toBe('');
      expect(coffeeLink?.textContent?.trim()).not.toBe('');
    });
  });

  describe("Footer Dividers", () => {
    it("should have pipe separators between links", () => {
      const dividers = document.querySelectorAll('.footer-divider');
      
      expect(dividers).toHaveLength(2);
      dividers.forEach(divider => {
        expect(divider.textContent).toBe('|');
      });
    });

    it("should have dividers positioned correctly", () => {
      const footerLinks = document.querySelector('.footer-links');
      const children = Array.from(footerLinks?.children || []);
      
      // Expected order: link, divider, link, divider, link
      expect(children).toHaveLength(5);
      expect(children[0].classList.contains('contact-link')).toBe(true);
      expect(children[1].classList.contains('footer-divider')).toBe(true);
      expect(children[2].classList.contains('github-sponsor-link')).toBe(true);
      expect(children[3].classList.contains('footer-divider')).toBe(true);
      expect(children[4].classList.contains('coffee-link')).toBe(true);
    });
  });
});