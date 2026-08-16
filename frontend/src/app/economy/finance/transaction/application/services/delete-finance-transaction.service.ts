import { Observable } from "rxjs";
import { DeleteFinanceTransactionPort } from "../../domain/ports/delete-finance-transaction.port";

export class DeleteFinanceTransactionService {
  constructor(
    private deleteFinanceTransactionPort: DeleteFinanceTransactionPort,
  ) {}

  deleteFinanceTransaction(financeTransactionId: string): Observable<void> {
    return this.deleteFinanceTransactionPort.deleteFinanceTransaction(
      financeTransactionId,
    );
  }
}
