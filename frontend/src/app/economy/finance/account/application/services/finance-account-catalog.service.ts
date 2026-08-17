import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ChoiceChipOption } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { FinanceAccountType } from "../../domain/models/finance-account-type.model";

const ACCOUNT_TYPES: Record<FinanceAccountType, string> = {
  [FinanceAccountType.BANK]: "🏦",
  [FinanceAccountType.CASH]: "💵",
  [FinanceAccountType.SAVINGS]: "🐷",
  [FinanceAccountType.CARD]: "💳",
  [FinanceAccountType.OTHER]: "📦",
};

const MODULE_PATH = "economy/finance/account";

@Injectable()
export class FinanceAccountCatalogService {
  private translationService = inject(TranslationService);

  types(): FinanceAccountType[] {
    return Object.keys(ACCOUNT_TYPES) as FinanceAccountType[];
  }

  emoji(type: FinanceAccountType): string {
    return ACCOUNT_TYPES[type];
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
      label: `${this.emoji(type)} ${this.label(type)}`,
    }));
  }
}
