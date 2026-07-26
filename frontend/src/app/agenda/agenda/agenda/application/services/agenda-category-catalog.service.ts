import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SupportedLanguages } from "@shared/i18n/domain/models/translation.model";
import { ChoiceChipOption } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { AgendaEntryKind } from "../../domain/models/agenda.model";

interface AgendaCategory {
  emoji: string;
  es: string;
  en: string;
}

const TASK_CATEGORIES: Record<string, AgendaCategory> = {
  groceries: { emoji: "🛒", es: "Compra", en: "Groceries" },
  cooking: { emoji: "🍳", es: "Cocina", en: "Cooking" },
  health: { emoji: "❤️", es: "Salud", en: "Health" },
  exercise: { emoji: "🏃", es: "Ejercicio", en: "Exercise" },
  errand: { emoji: "📋", es: "Recado", en: "Errand" },
  home: { emoji: "🏠", es: "Hogar", en: "Home" },
  personal: { emoji: "📌", es: "Personal", en: "Personal" },
  other: { emoji: "📅", es: "Otro", en: "Other" },
};

const APPOINTMENT_CATEGORIES: Record<string, AgendaCategory> = {
  nutritionist: { emoji: "🥗", es: "Nutricionista", en: "Nutritionist" },
  physio: { emoji: "💪", es: "Fisio", en: "Physio" },
  dentist: { emoji: "🦷", es: "Dentista", en: "Dentist" },
  doctor: { emoji: "🩺", es: "Médico", en: "Doctor" },
  training: { emoji: "🏋️", es: "Entreno", en: "Training" },
  bloodTest: { emoji: "🧪", es: "Analítica", en: "Blood test" },
  personal: { emoji: "📌", es: "Personal", en: "Personal" },
  other: { emoji: "📅", es: "Otro", en: "Other" },
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

  emoji(kind: AgendaEntryKind, category: string): string {
    return this.catalog(kind)[category]?.emoji ?? "";
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
    const label = this.label(kind, category);
    if (!label) return fallback;

    return `${this.emoji(kind, category)} ${label}`;
  }

  options(kind: AgendaEntryKind): ChoiceChipOption[] {
    return this.keys(kind).map((key) => ({
      value: key,
      label: `${this.emoji(kind, key)} ${this.label(kind, key)}`,
    }));
  }

  private catalog(kind: AgendaEntryKind): Record<string, AgendaCategory> {
    return kind === "appointment" ? APPOINTMENT_CATEGORIES : TASK_CATEGORIES;
  }
}
