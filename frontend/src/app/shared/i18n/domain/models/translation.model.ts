export interface TranslationMap {
  [key: string]: string | TranslationMap;
}

export enum SupportedLanguages {
  ES = "es",
  EN = "en",
}

export interface TranslationConfig {
  defaultLanguage: SupportedLanguages;
  availableLanguages: SupportedLanguages[];
}
