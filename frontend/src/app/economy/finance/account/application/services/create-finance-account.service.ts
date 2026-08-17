import { Observable } from "rxjs";
import { CreateFinanceAccountPort } from "../../domain/ports/create-finance-account.port";
import { FinanceAccountPayload } from "../../domain/models/finance-account-payload.model";

export class CreateFinanceAccountService {
  constructor(private createFinanceAccountPort: CreateFinanceAccountPort) {}

  createFinanceAccount(payload: FinanceAccountPayload): Observable<void> {
    return this.createFinanceAccountPort.createFinanceAccount(payload);
  }
}
