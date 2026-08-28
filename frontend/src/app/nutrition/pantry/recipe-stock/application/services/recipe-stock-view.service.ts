import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SupportedLanguages } from "@shared/i18n/domain/models/translation.model";

@Injectable()
export class RecipeStockViewService {
  private translationService = inject(TranslationService);

  servings(value: number): string {
    return new Intl.NumberFormat(this.locale(), {
      maximumFractionDigits: 2,
    }).format(value);
  }

  /**
   * The balance is allowed to go below zero, which reads as "the diary says you ate more than you
   * cooked". Stepping down from there keeps that debt instead of quietly rounding it away.
   */
  step(current: number, servings: number): number {
    return Math.round((current + servings) * 100) / 100;
  }

  private locale(): string {
    return SupportedLanguages.EN ===
      this.translationService.getCurrentLanguage()
      ? "en-GB"
      : "es-ES";
  }
}
