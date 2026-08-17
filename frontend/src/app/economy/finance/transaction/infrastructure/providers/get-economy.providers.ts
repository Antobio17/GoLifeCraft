import { Provider } from "@angular/core";
import { GetFinanceOverviewPort } from "@economy/finance/transaction/domain/ports/get-finance-overview.port";
import { GetFinanceTransactionsPort } from "@economy/finance/transaction/domain/ports/get-finance-transactions.port";
import { GetFinanceCalendarPort } from "@economy/finance/transaction/domain/ports/get-finance-calendar.port";
import { HttpGetFinanceOverviewAdapter } from "@economy/finance/transaction/infrastructure/adapters/http-get-finance-overview.adapter";
import { HttpGetFinanceTransactionsAdapter } from "@economy/finance/transaction/infrastructure/adapters/http-get-finance-transactions.adapter";
import { HttpGetFinanceCalendarAdapter } from "@economy/finance/transaction/infrastructure/adapters/http-get-finance-calendar.adapter";
import { GetFinanceOverviewService } from "@economy/finance/transaction/application/services/get-finance-overview.service";
import { GetFinanceTransactionsService } from "@economy/finance/transaction/application/services/get-finance-transactions.service";
import { GetFinanceCalendarService } from "@economy/finance/transaction/application/services/get-finance-calendar.service";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";
import { FinanceCalendarViewService } from "@economy/finance/transaction/application/services/finance-calendar-view.service";
import { FinanceCategoryCatalogService } from "@economy/finance/transaction/application/services/finance-category-catalog.service";
import { FinanceMovementGroupingService } from "@economy/finance/transaction/application/services/finance-movement-grouping.service";

export class GetEconomyProviders {
  static getProviders(): Provider[] {
    return [
      FinanceViewService,
      FinanceCalendarViewService,
      FinanceCategoryCatalogService,
      FinanceMovementGroupingService,
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
      {
        provide: GetFinanceTransactionsPort,
        useClass: HttpGetFinanceTransactionsAdapter,
      },
      {
        provide: GetFinanceTransactionsService,
        useFactory: (port: GetFinanceTransactionsPort) =>
          new GetFinanceTransactionsService(port),
        deps: [GetFinanceTransactionsPort],
      },
      {
        provide: GetFinanceCalendarPort,
        useClass: HttpGetFinanceCalendarAdapter,
      },
      {
        provide: GetFinanceCalendarService,
        useFactory: (port: GetFinanceCalendarPort) =>
          new GetFinanceCalendarService(port),
        deps: [GetFinanceCalendarPort],
      },
    ];
  }
}
