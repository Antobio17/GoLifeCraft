import { Observable } from "rxjs";
import { FinanceBudgetPayload } from "../models/finance-budget-payload.model";

export abstract class SaveFinanceBudgetPort {
  abstract saveFinanceBudget(payload: FinanceBudgetPayload): Observable<void>;
}
