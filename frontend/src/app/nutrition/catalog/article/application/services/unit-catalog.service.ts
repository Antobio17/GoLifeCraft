import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SupportedLanguages } from "@shared/i18n/domain/models/translation.model";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";

interface UnitLabel {
  es: string;
  en: string;
  esPlural: string;
  enPlural: string;
}

const UNIT_LABELS: Record<string, UnitLabel> = {
  unit: { es: "unidad", en: "unit", esPlural: "unidades", enPlural: "units" },
  slice: { es: "loncha", en: "slice", esPlural: "lonchas", enPlural: "slices" },
  bread_slice: {
    es: "rebanada",
    en: "bread slice",
    esPlural: "rebanadas",
    enPlural: "bread slices",
  },
  glass: { es: "vaso", en: "glass", esPlural: "vasos", enPlural: "glasses" },
  serving: {
    es: "ración",
    en: "serving",
    esPlural: "raciones",
    enPlural: "servings",
  },
  piece: { es: "pieza", en: "piece", esPlural: "piezas", enPlural: "pieces" },
  can: { es: "lata", en: "can", esPlural: "latas", enPlural: "cans" },
  jar: { es: "bote", en: "jar", esPlural: "botes", enPlural: "jars" },
  bag: { es: "bolsa", en: "bag", esPlural: "bolsas", enPlural: "bags" },
  carton: {
    es: "cartón",
    en: "carton",
    esPlural: "cartones",
    enPlural: "cartons",
  },
  container: {
    es: "envase",
    en: "container",
    esPlural: "envases",
    enPlural: "containers",
  },
  tablespoon: {
    es: "cucharada",
    en: "tablespoon",
    esPlural: "cucharadas",
    enPlural: "tablespoons",
  },
  pack: { es: "paquete", en: "pack", esPlural: "paquetes", enPlural: "packs" },
  handful: {
    es: "puñado",
    en: "handful",
    esPlural: "puñados",
    enPlural: "handfuls",
  },
};

const BASE_UNIT_SCALE: Record<string, { major: string; minor: string }> = {
  g: { major: "kg", minor: "g" },
  ml: { major: "L", minor: "ml" },
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

    return this.isEnglish() ? entry.en : entry.es;
  }

  pluralLabel(key: string, count: number): string {
    const entry = UNIT_LABELS[key];
    if (!entry) {
      return key;
    }

    if (count === 1) {
      return this.label(key);
    }

    return this.isEnglish() ? entry.enPlural : entry.esPlural;
  }

  options(): SelectOption[] {
    return this.keys().map((key) => ({ value: key, label: this.label(key) }));
  }

  amountLabel(value: number, baseUnit: string): string {
    const scale = BASE_UNIT_SCALE[baseUnit];
    if (!scale) {
      return `${this.decimal(value)} ${baseUnit}`;
    }

    if (Math.abs(value) < 1000) {
      return `${this.decimal(value)} ${scale.minor}`;
    }

    return `${this.decimal(value / 1000)} ${scale.major}`;
  }

  private decimal(value: number): string {
    return new Intl.NumberFormat(this.isEnglish() ? "en-GB" : "es-ES", {
      maximumFractionDigits: 2,
    }).format(value);
  }

  private isEnglish(): boolean {
    return (
      SupportedLanguages.EN === this.translationService.getCurrentLanguage()
    );
  }
}
