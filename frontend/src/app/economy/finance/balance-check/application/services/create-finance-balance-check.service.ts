import { Observable } from "rxjs";
import { CreateFinanceBalanceCheckPort } from "../../domain/ports/create-finance-balance-check.port";
import { FinanceBalanceCheckPayload } from "../../domain/models/finance-balance-check-payload.model";

export class CreateFinanceBalanceCheckService {
  constructor(
    private createFinanceBalanceCheckPort: CreateFinanceBalanceCheckPort,
  ) {}

  createFinanceBalanceCheck(
    payload: FinanceBalanceCheckPayload,
  ): Observable<void> {
    return this.createFinanceBalanceCheckPort.createFinanceBalanceCheck(
      payload,
    );
  }
}
