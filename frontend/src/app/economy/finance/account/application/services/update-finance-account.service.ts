import { Observable } from "rxjs";
import { UpdateFinanceAccountPort } from "../../domain/ports/update-finance-account.port";
import { FinanceAccountPayload } from "../../domain/models/finance-account-payload.model";

export class UpdateFinanceAccountService {
  constructor(private updateFinanceAccountPort: UpdateFinanceAccountPort) {}

  updateFinanceAccount(
    financeAccountId: string,
    payload: FinanceAccountPayload,
  ): Observable<void> {
    return this.updateFinanceAccountPort.updateFinanceAccount(
      financeAccountId,
      payload,
    );
  }
}
