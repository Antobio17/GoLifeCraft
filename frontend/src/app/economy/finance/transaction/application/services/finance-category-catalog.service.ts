import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ChoiceChipOption } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { FinanceCategory } from "../../domain/models/finance-category.model";

interface FinanceCategoryEntry {
  glyph: DsGlyph;
  color: string;
}

const CATEGORIES: Record<FinanceCategory, FinanceCategoryEntry> = {
  [FinanceCategory.GROCERIES]: {
    glyph: DsGlyph.Cart,
    color: "var(--ds-cat-groceries)",
  },
  [FinanceCategory.RESTAURANTS]: {
    glyph: DsGlyph.Plate,
    color: "var(--ds-cat-restaurants)",
  },
  [FinanceCategory.GYM]: {
    glyph: DsGlyph.Dumbbell,
    color: "var(--ds-cat-gym)",
  },
  [FinanceCategory.TRANSPORT]: {
    glyph: DsGlyph.Train,
    color: "var(--ds-cat-transport)",
  },
  [FinanceCategory.LEISURE]: {
    glyph: DsGlyph.Ticket,
    color: "var(--ds-cat-leisure)",
  },
  [FinanceCategory.HOME]: {
    glyph: DsGlyph.House,
    color: "var(--ds-cat-home)",
  },
  [FinanceCategory.BILLS]: {
    glyph: DsGlyph.Bulb,
    color: "var(--ds-cat-bills)",
  },
  [FinanceCategory.HEALTH]: {
    glyph: DsGlyph.HeartCross,
    color: "var(--ds-cat-health)",
  },
  [FinanceCategory.BEAUTY]: {
    glyph: DsGlyph.Scissors,
    color: "var(--ds-cat-beauty)",
  },
  [FinanceCategory.CLOTHING]: {
    glyph: DsGlyph.Shirt,
    color: "var(--ds-cat-clothing)",
  },
  [FinanceCategory.TREATS]: {
    glyph: DsGlyph.Cupcake,
    color: "var(--ds-cat-treats)",
  },
  [FinanceCategory.GIFTS]: {
    glyph: DsGlyph.Gift,
    color: "var(--ds-cat-gifts)",
  },
  [FinanceCategory.TRAVEL]: {
    glyph: DsGlyph.Plane,
    color: "var(--ds-cat-travel)",
  },
  [FinanceCategory.PETS]: {
    glyph: DsGlyph.Paw,
    color: "var(--ds-cat-pets)",
  },
  [FinanceCategory.SUBSCRIPTIONS]: {
    glyph: DsGlyph.Cycle,
    color: "var(--ds-cat-subscriptions)",
  },
  [FinanceCategory.INVESTMENTS]: {
    glyph: DsGlyph.TrendUp,
    color: "var(--ds-cat-investments)",
  },
  [FinanceCategory.OTHER]: {
    glyph: DsGlyph.Box,
    color: "var(--ds-cat-other)",
  },
};

const MODULE_PATH = "economy/finance/transaction";

@Injectable()
export class FinanceCategoryCatalogService {
  private translationService = inject(TranslationService);

  categories(): FinanceCategory[] {
    return Object.keys(CATEGORIES) as FinanceCategory[];
  }

  glyph(category: FinanceCategory): DsGlyph {
    return CATEGORIES[category].glyph;
  }

  incomeGlyph(): DsGlyph {
    return DsGlyph.Coins;
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
      label: this.label(category),
      glyph: this.glyph(category),
    }));
  }
}
