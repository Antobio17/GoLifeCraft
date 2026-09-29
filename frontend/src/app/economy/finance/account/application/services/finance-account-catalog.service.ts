import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ChoiceChipOption } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { FinanceAccountType } from "../../domain/models/finance-account-type.model";

const ACCOUNT_TYPES: Record<FinanceAccountType, DsGlyph> = {
  [FinanceAccountType.BANK]: DsGlyph.Bank,
  [FinanceAccountType.CASH]: DsGlyph.Banknote,
  [FinanceAccountType.SAVINGS]: DsGlyph.Piggy,
  [FinanceAccountType.CARD]: DsGlyph.Card,
  [FinanceAccountType.OTHER]: DsGlyph.Box,
};

const ACCOUNT_COLORS: Partial<Record<FinanceAccountType, string>> = {
  [FinanceAccountType.BANK]: "var(--ds-account-bank)",
  [FinanceAccountType.SAVINGS]: "var(--ds-account-savings)",
};

const MODULE_PATH = "economy/finance/account";

@Injectable()
export class FinanceAccountCatalogService {
  private translationService = inject(TranslationService);

  types(): FinanceAccountType[] {
    return Object.keys(ACCOUNT_TYPES) as FinanceAccountType[];
  }

  glyph(type: FinanceAccountType): DsGlyph {
    return ACCOUNT_TYPES[type];
  }

  color(type: FinanceAccountType): string {
    return ACCOUNT_COLORS[type] ?? "";
  }

  label(type: FinanceAccountType): string {
    return this.translationService.translate(
      `getFinanceAccounts.type.${type}`,
      MODULE_PATH,
    );
  }

  chipOptions(): ChoiceChipOption[] {
    return this.types().map((type) => ({
      value: type,
      label: this.label(type),
      glyph: this.glyph(type),
    }));
  }
}
