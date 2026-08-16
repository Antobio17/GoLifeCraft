import { Observable } from "rxjs";
import { FinanceTransactionPayload } from "../models/finance-transaction-payload.model";

export abstract class UpdateFinanceTransactionPort {
  abstract updateFinanceTransaction(
    financeTransactionId: string,
    payload: FinanceTransactionPayload,
  ): Observable<void>;
}
