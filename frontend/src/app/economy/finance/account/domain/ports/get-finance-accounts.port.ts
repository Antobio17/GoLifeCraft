import { Observable } from "rxjs";
import { GetFinanceAccountsResponse } from "../models/get-finance-accounts-response.model";

export abstract class GetFinanceAccountsPort {
  abstract getFinanceAccounts(): Observable<GetFinanceAccountsResponse>;
}
