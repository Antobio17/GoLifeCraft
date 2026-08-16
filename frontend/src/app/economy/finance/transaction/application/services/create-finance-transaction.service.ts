import { Observable } from "rxjs";
import { CreateFinanceTransactionPort } from "../../domain/ports/create-finance-transaction.port";
import { FinanceTransactionPayload } from "../../domain/models/finance-transaction-payload.model";

export class CreateFinanceTransactionService {
  constructor(
    private createFinanceTransactionPort: CreateFinanceTransactionPort,
  ) {}

  createFinanceTransaction(
    payload: FinanceTransactionPayload,
  ): Observable<void> {
    return this.createFinanceTransactionPort.createFinanceTransaction(payload);
  }
}
