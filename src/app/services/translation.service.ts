import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { TranslationLoaderService, TranslationFiles } from './translation-loader.service';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = 'en-US';
  private translations: TranslationFiles = {};
  private languageSubject = new BehaviorSubject<string>(this.currentLanguage);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public language$ = this.languageSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private translationLoader: TranslationLoaderService) {
    // Load default language on service initialization
    this.loadLanguage(this.currentLanguage);
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Load translations for a specific language
   * @param language - Language code to load
   */
  async loadLanguage(language: string): Promise<void> {
    if (this.translations[language]) {
      this.setCurrentLanguage(language);
      return;
    }

    this.loadingSubject.next(true);

    try {
      const translations = await firstValueFrom(this.translationLoader.loadTranslations(language));
      this.translations[language] = translations;
      this.setCurrentLanguage(language);
    } catch (error) {
      console.error(`Failed to load language ${language}:`, error);
      // Fallback to English if available
      if (language !== 'en-US' && this.translations['en-US']) {
        this.setCurrentLanguage('en-US');
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Set current language without loading (assumes already loaded)
   * @param language - Language code
   */
  private setCurrentLanguage(language: string): void {
    this.currentLanguage = language;
    this.languageSubject.next(language);
  }

  /**
   * Get translation for a key
   * @param key - Translation key in format 'filename.path.to.key'
   * @param params - Optional parameters for string interpolation
   */
  translate(key: string, params?: { [key: string]: string | number }): string {
    const [filename, ...keyParts] = key.split('.');
    const keyPath = keyParts.join('.');

    const fileTranslations = this.translations[this.currentLanguage]?.[filename];

    if (!fileTranslations) {
      console.warn(`Translation file '${filename}' not found for language '${this.currentLanguage}'`);
      return key;
    }

    let translation = this.getNestedValue(fileTranslations, keyPath);

    // Fallback to English if key not found in current language
    if (!translation && this.currentLanguage !== 'en-US') {
      const englishTranslations = this.translations['en-US']?.[filename];
      if (englishTranslations) {
        translation = this.getNestedValue(englishTranslations, keyPath);
      }
    }

    if (!translation) {
      console.warn(`Translation key '${key}' not found`);
      return key;
    }

    // Handle string interpolation
    if (params && typeof translation === 'string') {
      Object.keys(params).forEach(param => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param].toString());
      });
    }

    return translation;
  }

  /**
   * Get nested value from object using dot notation
   * @param obj - Object to search in
   * @param path - Dot notation path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages(): string[] {
    return this.translationLoader.getAvailableLanguages();
  }

  /**
   * Check if a language is loaded
   * @param language - Language code
   */
  isLanguageLoaded(language: string): boolean {
    return !!this.translations[language];
  }

  /**
   * Get instant translation (synchronous)
   * Use only when you're sure the translation is loaded
   * @param key - Translation key
   * @param params - Optional parameters
   */
  instant(key: string, params?: { [key: string]: string | number }): string {
    return this.translate(key, params);
  }
}
