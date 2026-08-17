import { Observable } from "rxjs";
import { CreateFinanceAccountPayload } from "../models/create-finance-account-payload.model";

export abstract class CreateFinanceAccountPort {
  abstract createFinanceAccount(
    payload: CreateFinanceAccountPayload,
  ): Observable<void>;
}
