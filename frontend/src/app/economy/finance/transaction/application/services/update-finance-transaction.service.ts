import { Observable } from "rxjs";
import { UpdateFinanceTransactionPort } from "../../domain/ports/update-finance-transaction.port";
import { FinanceTransactionPayload } from "../../domain/models/finance-transaction-payload.model";

export class UpdateFinanceTransactionService {
  constructor(
    private updateFinanceTransactionPort: UpdateFinanceTransactionPort,
  ) {}

  updateFinanceTransaction(
    financeTransactionId: string,
    payload: FinanceTransactionPayload,
  ): Observable<void> {
    return this.updateFinanceTransactionPort.updateFinanceTransaction(
      financeTransactionId,
      payload,
    );
  }
}
