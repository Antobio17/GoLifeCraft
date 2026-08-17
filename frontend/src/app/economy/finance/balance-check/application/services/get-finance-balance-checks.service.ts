import { Observable } from "rxjs";
import { GetFinanceBalanceChecksPort } from "../../domain/ports/get-finance-balance-checks.port";
import { GetFinanceBalanceChecksResponse } from "../../domain/models/get-finance-balance-checks-response.model";

export class GetFinanceBalanceChecksService {
  constructor(
    private getFinanceBalanceChecksPort: GetFinanceBalanceChecksPort,
  ) {}

  getFinanceBalanceChecks(
    accountId?: string,
  ): Observable<GetFinanceBalanceChecksResponse> {
    return this.getFinanceBalanceChecksPort.getFinanceBalanceChecks(accountId);
  }
}
