import { Observable } from "rxjs";
import { FinanceBalanceCheckPayload } from "../models/finance-balance-check-payload.model";

export abstract class CreateFinanceBalanceCheckPort {
  abstract createFinanceBalanceCheck(
    payload: FinanceBalanceCheckPayload,
  ): Observable<void>;
}
