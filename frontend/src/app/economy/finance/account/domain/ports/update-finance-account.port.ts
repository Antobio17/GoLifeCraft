import { Observable } from "rxjs";
import { FinanceAccountPayload } from "../models/finance-account-payload.model";

export abstract class UpdateFinanceAccountPort {
  abstract updateFinanceAccount(
    financeAccountId: string,
    payload: FinanceAccountPayload,
  ): Observable<void>;
}
