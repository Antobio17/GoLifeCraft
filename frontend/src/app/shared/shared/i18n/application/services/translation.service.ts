import { TranslationPort } from "../../domain/ports/translation.port";
import {
  SupportedLanguages,
  TranslationMap,
} from "../../domain/models/translation.model";

export class TranslationService {
  private currentLanguage: SupportedLanguages = SupportedLanguages.ES;
  private translations: Map<string, TranslationMap> = new Map();
  private inFlightRequests: Map<string, Promise<void>> = new Map();

  constructor(private translationPort: TranslationPort) {
    const savedLanguage = localStorage.getItem(
      "app-language",
    ) as SupportedLanguages;
    if (
      !savedLanguage ||
      !Object.values(SupportedLanguages).includes(savedLanguage)
    ) {
      this.currentLanguage = SupportedLanguages.ES;
      localStorage.setItem("app-language", SupportedLanguages.ES);
      return;
    }

    this.currentLanguage = savedLanguage;
  }

  getCurrentLanguage(): SupportedLanguages {
    return this.currentLanguage;
  }

  setLanguage(language: SupportedLanguages): void {
    this.currentLanguage = language;
    localStorage.setItem("app-language", language);

    this.translations.clear();
    this.inFlightRequests.clear();
  }

  setLanguageFromLocale(locale: string): void {
    const mapping: Record<string, SupportedLanguages> = {
      "es-ES": SupportedLanguages.ES,
      "en-US": SupportedLanguages.EN,
    };
    const language = mapping[locale] ?? SupportedLanguages.ES;
    this.setLanguage(language);
  }

  loadModuleTranslations(modulePath: string): Promise<void> {
    const cacheKey = `${modulePath}_${this.currentLanguage}`;

    if (this.translations.has(cacheKey)) {
      return Promise.resolve();
    }

    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey)!;
    }

    const promise = new Promise<void>((resolve) => {
      this.translationPort
        .loadTranslations(modulePath, this.currentLanguage)
        .subscribe({
          next: (translationMap: TranslationMap) => {
            this.translations.set(cacheKey, translationMap);
            this.inFlightRequests.delete(cacheKey);
            resolve();
          },
          error: () => {
            this.inFlightRequests.delete(cacheKey);
            resolve();
          },
        });
    });

    this.inFlightRequests.set(cacheKey, promise);
    return promise;
  }

  translate(
    key: string,
    modulePath: string,
    params?: Record<string, unknown>,
  ): string {
    const cacheKey = `${modulePath}_${this.currentLanguage}`;
    const translationMap = this.translations.get(cacheKey);

    if (!translationMap) {
      if (this.inFlightRequests.has(cacheKey)) {
        return "";
      }
      return key;
    }

    const translation = this.getNestedTranslation(translationMap, key);

    if (!translation) {
      return key;
    }

    if (!params) {
      return translation;
    }

    return translation.replace(/\{\{(\w+)\}\}/g, (_, k) =>
      k in params ? String(params[k]) : `{{${k}}}`,
    );
  }

  isModuleLoaded(modulePath: string): boolean {
    const cacheKey = `${modulePath}_${this.currentLanguage}`;
    return this.translations.has(cacheKey);
  }

  private getNestedTranslation(
    map: TranslationMap,
    key: string,
  ): string | null {
    const keys = key.split(".");
    let current: unknown = map;

    for (let i = 0; i < keys.length; i++) {
      if (!current || typeof current !== "object") return null;

      const obj = current as Record<string, unknown>;

      if (keys[i] in obj) {
        current = obj[keys[i]];
        continue;
      }

      const flatKey = keys.slice(i).join(".");
      if (flatKey in obj) {
        current = obj[flatKey];
        break;
      }

      return null;
    }

    return typeof current === "string" ? current : null;
  }
}
