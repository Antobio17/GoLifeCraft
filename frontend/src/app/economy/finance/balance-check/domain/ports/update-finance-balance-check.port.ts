import { Observable } from "rxjs";
import { FinanceBalanceCheckPayload } from "../models/finance-balance-check-payload.model";

export abstract class UpdateFinanceBalanceCheckPort {
  abstract updateFinanceBalanceCheck(
    financeBalanceCheckId: string,
    payload: FinanceBalanceCheckPayload,
  ): Observable<void>;
}
