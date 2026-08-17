import { Observable } from "rxjs";
import { DeleteFinanceAccountPort } from "../../domain/ports/delete-finance-account.port";

export class DeleteFinanceAccountService {
  constructor(private deleteFinanceAccountPort: DeleteFinanceAccountPort) {}

  deleteFinanceAccount(financeAccountId: string): Observable<void> {
    return this.deleteFinanceAccountPort.deleteFinanceAccount(financeAccountId);
  }
}
