import { Observable } from "rxjs";
import { FinanceAccountBalancePayload } from "../models/finance-account-balance-payload.model";

export abstract class SetFinanceAccountBalancePort {
  abstract setFinanceAccountBalance(
    financeAccountId: string,
    payload: FinanceAccountBalancePayload,
  ): Observable<void>;
}
