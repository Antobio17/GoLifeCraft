import { Observable } from "rxjs";
import { SaveFinanceBudgetPort } from "../../domain/ports/save-finance-budget.port";
import { FinanceBudgetPayload } from "../../domain/models/finance-budget-payload.model";

export class SaveFinanceBudgetService {
  constructor(private saveFinanceBudgetPort: SaveFinanceBudgetPort) {}

  saveFinanceBudget(payload: FinanceBudgetPayload): Observable<void> {
    return this.saveFinanceBudgetPort.saveFinanceBudget(payload);
  }
}
