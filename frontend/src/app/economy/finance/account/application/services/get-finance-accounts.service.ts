import { Observable } from "rxjs";
import { GetFinanceAccountsPort } from "../../domain/ports/get-finance-accounts.port";
import { GetFinanceAccountsResponse } from "../../domain/models/get-finance-accounts-response.model";

export class GetFinanceAccountsService {
  constructor(private getFinanceAccountsPort: GetFinanceAccountsPort) {}

  getFinanceAccounts(): Observable<GetFinanceAccountsResponse> {
    return this.getFinanceAccountsPort.getFinanceAccounts();
  }
}
