import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SupportedLanguages } from "@shared/i18n/domain/models/translation.model";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";

interface UnitLabel {
  es: string;
  en: string;
}

const UNIT_LABELS: Record<string, UnitLabel> = {
  unit: { es: "unidad", en: "unit" },
  slice: { es: "loncha", en: "slice" },
  bread_slice: { es: "rebanada", en: "bread slice" },
  glass: { es: "vaso", en: "glass" },
  serving: { es: "ración", en: "serving" },
  piece: { es: "pieza", en: "piece" },
  can: { es: "lata", en: "can" },
  jar: { es: "bote", en: "jar" },
  bag: { es: "bolsa", en: "bag" },
  carton: { es: "cartón", en: "carton" },
  container: { es: "envase", en: "container" },
  tablespoon: { es: "cucharada", en: "tablespoon" },
  pack: { es: "paquete", en: "pack" },
  handful: { es: "puñado", en: "handful" },
};

@Injectable({ providedIn: "root" })
export class UnitCatalogService {
  private translationService = inject(TranslationService);

  keys(): string[] {
    return Object.keys(UNIT_LABELS);
  }

  label(key: string): string {
    const entry = UNIT_LABELS[key];
    if (!entry) {
      return key;
    }

    return SupportedLanguages.EN ===
      this.translationService.getCurrentLanguage()
      ? entry.en
      : entry.es;
  }

  options(): SelectOption[] {
    return this.keys().map((key) => ({ value: key, label: this.label(key) }));
  }
}
