import { Observable } from "rxjs";
import { FinanceAccountPayload } from "../models/finance-account-payload.model";

export abstract class CreateFinanceAccountPort {
  abstract createFinanceAccount(
    payload: FinanceAccountPayload,
  ): Observable<void>;
}
