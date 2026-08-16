import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SupportedLanguages } from "@shared/i18n/domain/models/translation.model";
import { ChoiceChipOption } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { FinanceCategory } from "../../domain/models/finance-category.model";

interface FinanceCategoryEntry {
  emoji: string;
  color: string;
  es: string;
  en: string;
}

const CATEGORIES: Record<FinanceCategory, FinanceCategoryEntry> = {
  [FinanceCategory.GROCERIES]: {
    emoji: "🛒",
    color: "var(--ds-cat-groceries)",
    es: "Compra/Alimentación",
    en: "Groceries",
  },
  [FinanceCategory.RESTAURANTS]: {
    emoji: "🍽️",
    color: "var(--ds-cat-restaurants)",
    es: "Restaurantes",
    en: "Restaurants",
  },
  [FinanceCategory.GYM]: {
    emoji: "💪",
    color: "var(--ds-cat-gym)",
    es: "Suplementos/Gym",
    en: "Supplements/Gym",
  },
  [FinanceCategory.TRANSPORT]: {
    emoji: "🚇",
    color: "var(--ds-cat-transport)",
    es: "Transporte",
    en: "Transport",
  },
  [FinanceCategory.LEISURE]: {
    emoji: "🎬",
    color: "var(--ds-cat-leisure)",
    es: "Ocio",
    en: "Leisure",
  },
  [FinanceCategory.HOME]: {
    emoji: "🏠",
    color: "var(--ds-cat-home)",
    es: "Hogar",
    en: "Home",
  },
  [FinanceCategory.HEALTH]: {
    emoji: "🩺",
    color: "var(--ds-cat-health)",
    es: "Salud",
    en: "Health",
  },
  [FinanceCategory.SUBSCRIPTIONS]: {
    emoji: "🔁",
    color: "var(--ds-cat-subscriptions)",
    es: "Suscripciones",
    en: "Subscriptions",
  },
  [FinanceCategory.OTHER]: {
    emoji: "📦",
    color: "var(--ds-cat-other)",
    es: "Otros",
    en: "Other",
  },
};

const INCOME_EMOJI = "💰";

@Injectable()
export class FinanceCategoryCatalogService {
  private translationService = inject(TranslationService);

  categories(): FinanceCategory[] {
    return Object.keys(CATEGORIES) as FinanceCategory[];
  }

  emoji(category: FinanceCategory): string {
    return CATEGORIES[category].emoji;
  }

  incomeEmoji(): string {
    return INCOME_EMOJI;
  }

  color(category: FinanceCategory): string {
    return CATEGORIES[category].color;
  }

  label(category: FinanceCategory): string {
    const entry = CATEGORIES[category];

    return SupportedLanguages.EN ===
      this.translationService.getCurrentLanguage()
      ? entry.en
      : entry.es;
  }

  chipOptions(): ChoiceChipOption[] {
    return this.categories().map((category) => ({
      value: category,
      label: `${this.emoji(category)} ${this.label(category)}`,
    }));
  }
}
