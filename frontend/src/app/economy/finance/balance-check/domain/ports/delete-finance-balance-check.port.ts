import { Observable } from "rxjs";

export abstract class DeleteFinanceBalanceCheckPort {
  abstract deleteFinanceBalanceCheck(
    financeBalanceCheckId: string,
  ): Observable<void>;
}
