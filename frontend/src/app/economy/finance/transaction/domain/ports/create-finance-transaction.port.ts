import { Observable } from "rxjs";
import { FinanceTransactionPayload } from "../models/finance-transaction-payload.model";

export abstract class CreateFinanceTransactionPort {
  abstract createFinanceTransaction(
    payload: FinanceTransactionPayload,
  ): Observable<void>;
}
