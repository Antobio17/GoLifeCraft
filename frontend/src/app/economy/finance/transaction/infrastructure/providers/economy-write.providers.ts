import { Provider } from "@angular/core";
import { CreateFinanceTransactionPort } from "@economy/finance/transaction/domain/ports/create-finance-transaction.port";
import { UpdateFinanceTransactionPort } from "@economy/finance/transaction/domain/ports/update-finance-transaction.port";
import { DeleteFinanceTransactionPort } from "@economy/finance/transaction/domain/ports/delete-finance-transaction.port";
import { HttpCreateFinanceTransactionAdapter } from "@economy/finance/transaction/infrastructure/adapters/http-create-finance-transaction.adapter";
import { HttpUpdateFinanceTransactionAdapter } from "@economy/finance/transaction/infrastructure/adapters/http-update-finance-transaction.adapter";
import { HttpDeleteFinanceTransactionAdapter } from "@economy/finance/transaction/infrastructure/adapters/http-delete-finance-transaction.adapter";
import { CreateFinanceTransactionService } from "@economy/finance/transaction/application/services/create-finance-transaction.service";
import { UpdateFinanceTransactionService } from "@economy/finance/transaction/application/services/update-finance-transaction.service";
import { DeleteFinanceTransactionService } from "@economy/finance/transaction/application/services/delete-finance-transaction.service";
import { FinanceTransactionFormService } from "@economy/finance/transaction/application/services/finance-transaction-form.service";

export class EconomyWriteProviders {
  static getProviders(): Provider[] {
    return [
      FinanceTransactionFormService,
      {
        provide: CreateFinanceTransactionPort,
        useClass: HttpCreateFinanceTransactionAdapter,
      },
      {
        provide: CreateFinanceTransactionService,
        useFactory: (port: CreateFinanceTransactionPort) =>
          new CreateFinanceTransactionService(port),
        deps: [CreateFinanceTransactionPort],
      },
      {
        provide: UpdateFinanceTransactionPort,
        useClass: HttpUpdateFinanceTransactionAdapter,
      },
      {
        provide: UpdateFinanceTransactionService,
        useFactory: (port: UpdateFinanceTransactionPort) =>
          new UpdateFinanceTransactionService(port),
        deps: [UpdateFinanceTransactionPort],
      },
      {
        provide: DeleteFinanceTransactionPort,
        useClass: HttpDeleteFinanceTransactionAdapter,
      },
      {
        provide: DeleteFinanceTransactionService,
        useFactory: (port: DeleteFinanceTransactionPort) =>
          new DeleteFinanceTransactionService(port),
        deps: [DeleteFinanceTransactionPort],
      },
    ];
  }
}
