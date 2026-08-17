import { Observable } from "rxjs";
import { DeleteFinanceBalanceCheckPort } from "../../domain/ports/delete-finance-balance-check.port";

export class DeleteFinanceBalanceCheckService {
  constructor(
    private deleteFinanceBalanceCheckPort: DeleteFinanceBalanceCheckPort,
  ) {}

  deleteFinanceBalanceCheck(financeBalanceCheckId: string): Observable<void> {
    return this.deleteFinanceBalanceCheckPort.deleteFinanceBalanceCheck(
      financeBalanceCheckId,
    );
  }
}
