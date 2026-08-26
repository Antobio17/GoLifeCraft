import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ChoiceChipOption } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { FinanceCategory } from "../../domain/models/finance-category.model";

interface FinanceCategoryEntry {
  emoji: string;
  color: string;
}

const CATEGORIES: Record<FinanceCategory, FinanceCategoryEntry> = {
  [FinanceCategory.GROCERIES]: {
    emoji: "🛒",
    color: "var(--ds-cat-groceries)",
  },
  [FinanceCategory.RESTAURANTS]: {
    emoji: "🍽️",
    color: "var(--ds-cat-restaurants)",
  },
  [FinanceCategory.GYM]: {
    emoji: "💪",
    color: "var(--ds-cat-gym)",
  },
  [FinanceCategory.TRANSPORT]: {
    emoji: "🚇",
    color: "var(--ds-cat-transport)",
  },
  [FinanceCategory.LEISURE]: {
    emoji: "🎬",
    color: "var(--ds-cat-leisure)",
  },
  [FinanceCategory.HOME]: {
    emoji: "🏠",
    color: "var(--ds-cat-home)",
  },
  [FinanceCategory.BILLS]: {
    emoji: "💡",
    color: "var(--ds-cat-bills)",
  },
  [FinanceCategory.HEALTH]: {
    emoji: "🩺",
    color: "var(--ds-cat-health)",
  },
  [FinanceCategory.BEAUTY]: {
    emoji: "💇",
    color: "var(--ds-cat-beauty)",
  },
  [FinanceCategory.CLOTHING]: {
    emoji: "👕",
    color: "var(--ds-cat-clothing)",
  },
  [FinanceCategory.TREATS]: {
    emoji: "🍫",
    color: "var(--ds-cat-treats)",
  },
  [FinanceCategory.GIFTS]: {
    emoji: "🎁",
    color: "var(--ds-cat-gifts)",
  },
  [FinanceCategory.TRAVEL]: {
    emoji: "✈️",
    color: "var(--ds-cat-travel)",
  },
  [FinanceCategory.PETS]: {
    emoji: "🐾",
    color: "var(--ds-cat-pets)",
  },
  [FinanceCategory.SUBSCRIPTIONS]: {
    emoji: "🔁",
    color: "var(--ds-cat-subscriptions)",
  },
  [FinanceCategory.OTHER]: {
    emoji: "📦",
    color: "var(--ds-cat-other)",
  },
};

const MODULE_PATH = "economy/finance/transaction";
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

  loadTranslations(): Promise<void> {
    return this.translationService.loadModuleTranslations(MODULE_PATH);
  }

  label(category: FinanceCategory): string {
    return this.translationService.translate(
      `getEconomy.category.${category}`,
      MODULE_PATH,
    );
  }

  chipOptions(): ChoiceChipOption[] {
    return this.categories().map((category) => ({
      value: category,
      label: `${this.emoji(category)} ${this.label(category)}`,
    }));
  }
}
