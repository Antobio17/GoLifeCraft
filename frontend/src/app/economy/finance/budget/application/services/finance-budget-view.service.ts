import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { BudgetMeterTone } from "@shared/design-system/budget-meter/infrastructure/components/budget-meter.component";
import { FinanceBudgetStatus } from "../../domain/models/finance-budget-status.model";

const MODULE_PATH = "economy/finance/budget";

const TONE_BY_STATUS: Record<FinanceBudgetStatus, BudgetMeterTone> = {
  [FinanceBudgetStatus.ON_TRACK]: "positive",
  [FinanceBudgetStatus.AT_RISK]: "warning",
  [FinanceBudgetStatus.OVER]: "danger",
};

@Injectable()
export class FinanceBudgetViewService {
  private translationService = inject(TranslationService);

  tone(status: FinanceBudgetStatus): BudgetMeterTone {
    return TONE_BY_STATUS[status] ?? "positive";
  }

  positive(status: FinanceBudgetStatus): boolean {
    return status === FinanceBudgetStatus.ON_TRACK;
  }

  statusLabel(status: FinanceBudgetStatus): string {
    return this.translate(`getFinanceBudget.status.${status}`);
  }

  savingsStatusLabel(status: FinanceBudgetStatus): string {
    return this.translate(`getFinanceBudget.savingsStatus.${status}`);
  }

  /**
   * "Te sobran 40 €" cuando se va por debajo del ritmo del mes y "te has pasado
   * 40 €" cuando se va por encima: el signo ya lo cuenta el color de la barra.
   */
  differenceLabel(difference: number, money: string): string {
    const key =
      difference >= 0
        ? "getFinanceBudget.pace.under"
        : "getFinanceBudget.pace.over";

    return this.translate(key).replace("{amount}", money);
  }

  remainingLabel(remaining: number, money: string): string {
    const key =
      remaining >= 0
        ? "getFinanceBudget.remaining.left"
        : "getFinanceBudget.remaining.exceeded";

    return this.translate(key).replace("{amount}", money);
  }

  percentage(ratio: number): string {
    return `${Math.round(ratio * 100)}%`;
  }

  private translate(key: string): string {
    return this.translationService.translate(key, MODULE_PATH);
  }
}
