import { Observable } from "rxjs";
import { GetFinanceBudgetSettingsResponse } from "../models/get-finance-budget-settings-response.model";

export abstract class GetFinanceBudgetSettingsPort {
  abstract getFinanceBudgetSettings(): Observable<GetFinanceBudgetSettingsResponse>;
}
