import { Observable } from "rxjs";
import { GetFinanceBalanceChecksResponse } from "../models/get-finance-balance-checks-response.model";

export abstract class GetFinanceBalanceChecksPort {
  abstract getFinanceBalanceChecks(
    accountId?: string,
  ): Observable<GetFinanceBalanceChecksResponse>;
}
