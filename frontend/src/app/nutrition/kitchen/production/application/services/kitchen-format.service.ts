import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SupportedLanguages } from "@shared/i18n/domain/models/translation.model";

@Injectable()
export class KitchenFormatService {
  private translationService = inject(TranslationService);

  decimal(value: number): string {
    return new Intl.NumberFormat(this.locale(), {
      maximumFractionDigits: 2,
    }).format(value);
  }

  locale(): string {
    return SupportedLanguages.EN ===
      this.translationService.getCurrentLanguage()
      ? "en-GB"
      : "es-ES";
  }
}
