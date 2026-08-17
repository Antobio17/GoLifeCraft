import { Observable } from "rxjs";
import { UpdateFinanceBalanceCheckPort } from "../../domain/ports/update-finance-balance-check.port";
import { FinanceBalanceCheckPayload } from "../../domain/models/finance-balance-check-payload.model";

export class UpdateFinanceBalanceCheckService {
  constructor(
    private updateFinanceBalanceCheckPort: UpdateFinanceBalanceCheckPort,
  ) {}

  updateFinanceBalanceCheck(
    financeBalanceCheckId: string,
    payload: FinanceBalanceCheckPayload,
  ): Observable<void> {
    return this.updateFinanceBalanceCheckPort.updateFinanceBalanceCheck(
      financeBalanceCheckId,
      payload,
    );
  }
}
