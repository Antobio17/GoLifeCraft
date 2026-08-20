import { Observable } from "rxjs";
import { GetFinanceBudgetResponse } from "../models/get-finance-budget-response.model";

export abstract class GetFinanceBudgetPort {
  abstract getFinanceBudget(
    month: string,
  ): Observable<GetFinanceBudgetResponse>;
}
