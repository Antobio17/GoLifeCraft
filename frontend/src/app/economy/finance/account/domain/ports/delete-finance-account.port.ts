import { Observable } from "rxjs";

export abstract class DeleteFinanceAccountPort {
  abstract deleteFinanceAccount(financeAccountId: string): Observable<void>;
}
