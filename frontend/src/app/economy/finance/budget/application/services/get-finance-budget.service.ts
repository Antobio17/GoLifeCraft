import { Observable } from "rxjs";
import { GetFinanceBudgetPort } from "../../domain/ports/get-finance-budget.port";
import { GetFinanceBudgetResponse } from "../../domain/models/get-finance-budget-response.model";

export class GetFinanceBudgetService {
  constructor(private getFinanceBudgetPort: GetFinanceBudgetPort) {}

  getFinanceBudget(month: string): Observable<GetFinanceBudgetResponse> {
    return this.getFinanceBudgetPort.getFinanceBudget(month);
  }
}
