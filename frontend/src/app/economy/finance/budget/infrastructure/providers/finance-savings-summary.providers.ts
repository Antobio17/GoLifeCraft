import { Provider } from "@angular/core";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";
import { GetFinanceBudgetPort } from "@economy/finance/budget/domain/ports/get-finance-budget.port";
import { HttpGetFinanceBudgetAdapter } from "@economy/finance/budget/infrastructure/adapters/http-get-finance-budget.adapter";
import { GetFinanceBudgetService } from "@economy/finance/budget/application/services/get-finance-budget.service";
import { FinanceBudgetViewService } from "@economy/finance/budget/application/services/finance-budget-view.service";

export class FinanceSavingsSummaryProviders {
  static getProviders(): Provider[] {
    return [
      FinanceViewService,
      FinanceBudgetViewService,
      {
        provide: GetFinanceBudgetPort,
        useClass: HttpGetFinanceBudgetAdapter,
      },
      {
        provide: GetFinanceBudgetService,
        useFactory: (port: GetFinanceBudgetPort) =>
          new GetFinanceBudgetService(port),
        deps: [GetFinanceBudgetPort],
      },
    ];
  }
}
