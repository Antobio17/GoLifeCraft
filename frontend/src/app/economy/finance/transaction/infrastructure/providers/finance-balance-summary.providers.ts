import { Provider } from "@angular/core";
import { GetFinanceOverviewPort } from "@economy/finance/transaction/domain/ports/get-finance-overview.port";
import { HttpGetFinanceOverviewAdapter } from "@economy/finance/transaction/infrastructure/adapters/http-get-finance-overview.adapter";
import { GetFinanceOverviewService } from "@economy/finance/transaction/application/services/get-finance-overview.service";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";

export class FinanceBalanceSummaryProviders {
  static getProviders(): Provider[] {
    return [
      FinanceViewService,
      {
        provide: GetFinanceOverviewPort,
        useClass: HttpGetFinanceOverviewAdapter,
      },
      {
        provide: GetFinanceOverviewService,
        useFactory: (port: GetFinanceOverviewPort) =>
          new GetFinanceOverviewService(port),
        deps: [GetFinanceOverviewPort],
      },
    ];
  }
}
