import { Provider } from "@angular/core";
import { GetFinanceAccountsPort } from "@economy/finance/account/domain/ports/get-finance-accounts.port";
import { CreateFinanceAccountPort } from "@economy/finance/account/domain/ports/create-finance-account.port";
import { UpdateFinanceAccountPort } from "@economy/finance/account/domain/ports/update-finance-account.port";
import { DeleteFinanceAccountPort } from "@economy/finance/account/domain/ports/delete-finance-account.port";
import { HttpGetFinanceAccountsAdapter } from "@economy/finance/account/infrastructure/adapters/http-get-finance-accounts.adapter";
import { HttpCreateFinanceAccountAdapter } from "@economy/finance/account/infrastructure/adapters/http-create-finance-account.adapter";
import { HttpUpdateFinanceAccountAdapter } from "@economy/finance/account/infrastructure/adapters/http-update-finance-account.adapter";
import { HttpDeleteFinanceAccountAdapter } from "@economy/finance/account/infrastructure/adapters/http-delete-finance-account.adapter";
import { GetFinanceAccountsService } from "@economy/finance/account/application/services/get-finance-accounts.service";
import { CreateFinanceAccountService } from "@economy/finance/account/application/services/create-finance-account.service";
import { UpdateFinanceAccountService } from "@economy/finance/account/application/services/update-finance-account.service";
import { DeleteFinanceAccountService } from "@economy/finance/account/application/services/delete-finance-account.service";
import { FinanceAccountCatalogService } from "@economy/finance/account/application/services/finance-account-catalog.service";
import { FinanceAccountFormService } from "@economy/finance/account/application/services/finance-account-form.service";

export class FinanceAccountProviders {
  static getProviders(): Provider[] {
    return [
      FinanceAccountCatalogService,
      FinanceAccountFormService,
      {
        provide: GetFinanceAccountsPort,
        useClass: HttpGetFinanceAccountsAdapter,
      },
      {
        provide: GetFinanceAccountsService,
        useFactory: (port: GetFinanceAccountsPort) =>
          new GetFinanceAccountsService(port),
        deps: [GetFinanceAccountsPort],
      },
      {
        provide: CreateFinanceAccountPort,
        useClass: HttpCreateFinanceAccountAdapter,
      },
      {
        provide: CreateFinanceAccountService,
        useFactory: (port: CreateFinanceAccountPort) =>
          new CreateFinanceAccountService(port),
        deps: [CreateFinanceAccountPort],
      },
      {
        provide: UpdateFinanceAccountPort,
        useClass: HttpUpdateFinanceAccountAdapter,
      },
      {
        provide: UpdateFinanceAccountService,
        useFactory: (port: UpdateFinanceAccountPort) =>
          new UpdateFinanceAccountService(port),
        deps: [UpdateFinanceAccountPort],
      },
      {
        provide: DeleteFinanceAccountPort,
        useClass: HttpDeleteFinanceAccountAdapter,
      },
      {
        provide: DeleteFinanceAccountService,
        useFactory: (port: DeleteFinanceAccountPort) =>
          new DeleteFinanceAccountService(port),
        deps: [DeleteFinanceAccountPort],
      },
    ];
  }
}
