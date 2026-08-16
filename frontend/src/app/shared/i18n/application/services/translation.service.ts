import { signal } from "@angular/core";
import { TranslationPort } from "../../domain/ports/translation.port";
import {
  SupportedLanguages,
  TranslationMap,
} from "../../domain/models/translation.model";

const LOCALE_BY_LANGUAGE: Record<SupportedLanguages, string> = {
  [SupportedLanguages.ES]: "es-ES",
  [SupportedLanguages.EN]: "en-GB",
};

export class TranslationService {
  private readonly currentLanguage = signal<SupportedLanguages>(
    SupportedLanguages.ES,
  );
  private readonly translations = signal<Map<string, TranslationMap>>(
    new Map(),
  );
  private readonly inFlightRequests: Map<string, Promise<void>> = new Map();

  constructor(private translationPort: TranslationPort) {
    this.currentLanguage.set(this.restoreLanguage());
  }

  getCurrentLanguage(): SupportedLanguages {
    return this.currentLanguage();
  }

  getLocale(): string {
    return LOCALE_BY_LANGUAGE[this.currentLanguage()];
  }

  setLanguage(language: SupportedLanguages): void {
    const reloadableModulePaths = this.loadedModulePaths();

    this.currentLanguage.set(language);
    localStorage.setItem("app-language", language);

    this.translations.set(new Map());
    this.inFlightRequests.clear();

    reloadableModulePaths.forEach((modulePath) =>
      this.loadModuleTranslations(modulePath),
    );
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
    const cacheKey = this.cacheKey(modulePath);

    if (this.translations().has(cacheKey)) {
      return Promise.resolve();
    }

    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey)!;
    }

    const promise = new Promise<void>((resolve) => {
      this.translationPort
        .loadTranslations(modulePath, this.currentLanguage())
        .subscribe({
          next: (translationMap: TranslationMap) => {
            this.cacheTranslations(cacheKey, translationMap);
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
    const cacheKey = this.cacheKey(modulePath);
    const translationMap = this.translations().get(cacheKey);

    if (!translationMap && this.inFlightRequests.has(cacheKey)) {
      return "";
    }

    if (!translationMap) {
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
    return this.translations().has(this.cacheKey(modulePath));
  }

  private restoreLanguage(): SupportedLanguages {
    const savedLanguage = localStorage.getItem(
      "app-language",
    ) as SupportedLanguages;

    if (
      savedLanguage &&
      Object.values(SupportedLanguages).includes(savedLanguage)
    ) {
      return savedLanguage;
    }

    localStorage.setItem("app-language", SupportedLanguages.ES);
    return SupportedLanguages.ES;
  }

  private cacheKey(modulePath: string): string {
    return `${modulePath}::${this.currentLanguage()}`;
  }

  private loadedModulePaths(): string[] {
    return [...this.translations().keys()].map((cacheKey) =>
      cacheKey.slice(0, cacheKey.lastIndexOf("::")),
    );
  }

  private cacheTranslations(
    cacheKey: string,
    translationMap: TranslationMap,
  ): void {
    const nextTranslations = new Map(this.translations());
    nextTranslations.set(cacheKey, translationMap);
    this.translations.set(nextTranslations);
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
