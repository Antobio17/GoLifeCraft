import { Provider } from "@angular/core";
import { GetFinanceBudgetPort } from "@economy/finance/budget/domain/ports/get-finance-budget.port";
import { GetFinanceBudgetSettingsPort } from "@economy/finance/budget/domain/ports/get-finance-budget-settings.port";
import { SaveFinanceBudgetPort } from "@economy/finance/budget/domain/ports/save-finance-budget.port";
import { HttpGetFinanceBudgetAdapter } from "@economy/finance/budget/infrastructure/adapters/http-get-finance-budget.adapter";
import { HttpGetFinanceBudgetSettingsAdapter } from "@economy/finance/budget/infrastructure/adapters/http-get-finance-budget-settings.adapter";
import { HttpSaveFinanceBudgetAdapter } from "@economy/finance/budget/infrastructure/adapters/http-save-finance-budget.adapter";
import { GetFinanceBudgetService } from "@economy/finance/budget/application/services/get-finance-budget.service";
import { GetFinanceBudgetSettingsService } from "@economy/finance/budget/application/services/get-finance-budget-settings.service";
import { SaveFinanceBudgetService } from "@economy/finance/budget/application/services/save-finance-budget.service";
import { FinanceBudgetFormService } from "@economy/finance/budget/application/services/finance-budget-form.service";
import { FinanceBudgetViewService } from "@economy/finance/budget/application/services/finance-budget-view.service";

export class FinanceBudgetProviders {
  static getProviders(): Provider[] {
    return [
      FinanceBudgetFormService,
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
      {
        provide: GetFinanceBudgetSettingsPort,
        useClass: HttpGetFinanceBudgetSettingsAdapter,
      },
      {
        provide: GetFinanceBudgetSettingsService,
        useFactory: (port: GetFinanceBudgetSettingsPort) =>
          new GetFinanceBudgetSettingsService(port),
        deps: [GetFinanceBudgetSettingsPort],
      },
      {
        provide: SaveFinanceBudgetPort,
        useClass: HttpSaveFinanceBudgetAdapter,
      },
      {
        provide: SaveFinanceBudgetService,
        useFactory: (port: SaveFinanceBudgetPort) =>
          new SaveFinanceBudgetService(port),
        deps: [SaveFinanceBudgetPort],
      },
    ];
  }
}
