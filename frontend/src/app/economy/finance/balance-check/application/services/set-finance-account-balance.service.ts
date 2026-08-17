import { Observable } from "rxjs";
import { SetFinanceAccountBalancePort } from "../../domain/ports/set-finance-account-balance.port";
import { FinanceAccountBalancePayload } from "../../domain/models/finance-account-balance-payload.model";

export class SetFinanceAccountBalanceService {
  constructor(
    private setFinanceAccountBalancePort: SetFinanceAccountBalancePort,
  ) {}

  setFinanceAccountBalance(
    financeAccountId: string,
    payload: FinanceAccountBalancePayload,
  ): Observable<void> {
    return this.setFinanceAccountBalancePort.setFinanceAccountBalance(
      financeAccountId,
      payload,
    );
  }
}
