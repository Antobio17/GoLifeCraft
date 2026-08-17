import { Provider } from "@angular/core";
import { GetFinanceBalanceChecksPort } from "@economy/finance/balance-check/domain/ports/get-finance-balance-checks.port";
import { CreateFinanceBalanceCheckPort } from "@economy/finance/balance-check/domain/ports/create-finance-balance-check.port";
import { UpdateFinanceBalanceCheckPort } from "@economy/finance/balance-check/domain/ports/update-finance-balance-check.port";
import { DeleteFinanceBalanceCheckPort } from "@economy/finance/balance-check/domain/ports/delete-finance-balance-check.port";
import { SetFinanceAccountBalancePort } from "@economy/finance/balance-check/domain/ports/set-finance-account-balance.port";
import { HttpGetFinanceBalanceChecksAdapter } from "@economy/finance/balance-check/infrastructure/adapters/http-get-finance-balance-checks.adapter";
import { HttpCreateFinanceBalanceCheckAdapter } from "@economy/finance/balance-check/infrastructure/adapters/http-create-finance-balance-check.adapter";
import { HttpUpdateFinanceBalanceCheckAdapter } from "@economy/finance/balance-check/infrastructure/adapters/http-update-finance-balance-check.adapter";
import { HttpDeleteFinanceBalanceCheckAdapter } from "@economy/finance/balance-check/infrastructure/adapters/http-delete-finance-balance-check.adapter";
import { HttpSetFinanceAccountBalanceAdapter } from "@economy/finance/balance-check/infrastructure/adapters/http-set-finance-account-balance.adapter";
import { GetFinanceBalanceChecksService } from "@economy/finance/balance-check/application/services/get-finance-balance-checks.service";
import { CreateFinanceBalanceCheckService } from "@economy/finance/balance-check/application/services/create-finance-balance-check.service";
import { UpdateFinanceBalanceCheckService } from "@economy/finance/balance-check/application/services/update-finance-balance-check.service";
import { DeleteFinanceBalanceCheckService } from "@economy/finance/balance-check/application/services/delete-finance-balance-check.service";
import { SetFinanceAccountBalanceService } from "@economy/finance/balance-check/application/services/set-finance-account-balance.service";
import { FinanceBalanceCheckFormService } from "@economy/finance/balance-check/application/services/finance-balance-check-form.service";

export class FinanceBalanceCheckProviders {
  static getProviders(): Provider[] {
    return [
      FinanceBalanceCheckFormService,
      {
        provide: GetFinanceBalanceChecksPort,
        useClass: HttpGetFinanceBalanceChecksAdapter,
      },
      {
        provide: GetFinanceBalanceChecksService,
        useFactory: (port: GetFinanceBalanceChecksPort) =>
          new GetFinanceBalanceChecksService(port),
        deps: [GetFinanceBalanceChecksPort],
      },
      {
        provide: CreateFinanceBalanceCheckPort,
        useClass: HttpCreateFinanceBalanceCheckAdapter,
      },
      {
        provide: CreateFinanceBalanceCheckService,
        useFactory: (port: CreateFinanceBalanceCheckPort) =>
          new CreateFinanceBalanceCheckService(port),
        deps: [CreateFinanceBalanceCheckPort],
      },
      {
        provide: UpdateFinanceBalanceCheckPort,
        useClass: HttpUpdateFinanceBalanceCheckAdapter,
      },
      {
        provide: UpdateFinanceBalanceCheckService,
        useFactory: (port: UpdateFinanceBalanceCheckPort) =>
          new UpdateFinanceBalanceCheckService(port),
        deps: [UpdateFinanceBalanceCheckPort],
      },
      {
        provide: DeleteFinanceBalanceCheckPort,
        useClass: HttpDeleteFinanceBalanceCheckAdapter,
      },
      {
        provide: DeleteFinanceBalanceCheckService,
        useFactory: (port: DeleteFinanceBalanceCheckPort) =>
          new DeleteFinanceBalanceCheckService(port),
        deps: [DeleteFinanceBalanceCheckPort],
      },
      {
        provide: SetFinanceAccountBalancePort,
        useClass: HttpSetFinanceAccountBalanceAdapter,
      },
      {
        provide: SetFinanceAccountBalanceService,
        useFactory: (port: SetFinanceAccountBalancePort) =>
          new SetFinanceAccountBalanceService(port),
        deps: [SetFinanceAccountBalancePort],
      },
    ];
  }
}
