import { Observable } from "rxjs";
import { CreateFinanceAccountPort } from "../../domain/ports/create-finance-account.port";
import { CreateFinanceAccountPayload } from "../../domain/models/create-finance-account-payload.model";

export class CreateFinanceAccountService {
  constructor(private createFinanceAccountPort: CreateFinanceAccountPort) {}

  createFinanceAccount(payload: CreateFinanceAccountPayload): Observable<void> {
    return this.createFinanceAccountPort.createFinanceAccount(payload);
  }
}
