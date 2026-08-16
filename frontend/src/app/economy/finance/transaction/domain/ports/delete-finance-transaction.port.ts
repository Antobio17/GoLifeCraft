import { Observable } from "rxjs";

export abstract class DeleteFinanceTransactionPort {
  abstract deleteFinanceTransaction(
    financeTransactionId: string,
  ): Observable<void>;
}
