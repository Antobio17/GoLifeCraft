import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SupportedLanguages } from "@shared/i18n/domain/models/translation.model";
import { ChoiceChipOption } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { AgendaEntryKind } from "../../domain/models/agenda.model";

interface AgendaCategory {
  glyph: DsGlyph;
  es: string;
  en: string;
}

const TASK_CATEGORIES: Record<string, AgendaCategory> = {
  groceries: { glyph: DsGlyph.Cart, es: "Compra", en: "Groceries" },
  cooking: { glyph: DsGlyph.Pan, es: "Cocina", en: "Cooking" },
  health: { glyph: DsGlyph.HeartCross, es: "Salud", en: "Health" },
  exercise: { glyph: DsGlyph.Sneaker, es: "Ejercicio", en: "Exercise" },
  errand: { glyph: DsGlyph.Clipboard, es: "Recado", en: "Errand" },
  home: { glyph: DsGlyph.House, es: "Hogar", en: "Home" },
  personal: { glyph: DsGlyph.Pin, es: "Personal", en: "Personal" },
  other: { glyph: DsGlyph.Calendar, es: "Otro", en: "Other" },
};

const APPOINTMENT_CATEGORIES: Record<string, AgendaCategory> = {
  nutritionist: {
    glyph: DsGlyph.Apple,
    es: "Nutricionista",
    en: "Nutritionist",
  },
  physio: { glyph: DsGlyph.Bandage, es: "Fisio", en: "Physio" },
  dentist: { glyph: DsGlyph.Tooth, es: "Dentista", en: "Dentist" },
  doctor: { glyph: DsGlyph.Stethoscope, es: "Médico", en: "Doctor" },
  training: { glyph: DsGlyph.Dumbbell, es: "Entreno", en: "Training" },
  bloodTest: { glyph: DsGlyph.Drop, es: "Analítica", en: "Blood test" },
  personal: { glyph: DsGlyph.Pin, es: "Personal", en: "Personal" },
  other: { glyph: DsGlyph.Calendar, es: "Otro", en: "Other" },
};

@Injectable()
export class AgendaCategoryCatalogService {
  private translationService = inject(TranslationService);

  keys(kind: AgendaEntryKind): string[] {
    return Object.keys(this.catalog(kind));
  }

  belongsTo(kind: AgendaEntryKind, category: string): boolean {
    return category === "" || this.catalog(kind)[category] !== undefined;
  }

  glyph(kind: AgendaEntryKind, category: string): DsGlyph | null {
    return this.catalog(kind)[category]?.glyph ?? null;
  }

  label(kind: AgendaEntryKind, category: string): string {
    const entry = this.catalog(kind)[category];
    if (!entry) return "";

    return SupportedLanguages.EN ===
      this.translationService.getCurrentLanguage()
      ? entry.en
      : entry.es;
  }

  badgeLabel(
    kind: AgendaEntryKind,
    category: string,
    fallback: string,
  ): string {
    return this.label(kind, category) || fallback;
  }

  options(kind: AgendaEntryKind): ChoiceChipOption[] {
    return this.keys(kind).map((key) => ({
      value: key,
      label: this.label(kind, key),
      glyph: this.catalog(kind)[key].glyph,
    }));
  }

  private catalog(kind: AgendaEntryKind): Record<string, AgendaCategory> {
    return kind === "appointment" ? APPOINTMENT_CATEGORIES : TASK_CATEGORIES;
  }
}
