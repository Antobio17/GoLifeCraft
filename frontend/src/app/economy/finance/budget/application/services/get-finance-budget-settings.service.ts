import { Observable } from "rxjs";
import { GetFinanceBudgetSettingsPort } from "../../domain/ports/get-finance-budget-settings.port";
import { GetFinanceBudgetSettingsResponse } from "../../domain/models/get-finance-budget-settings-response.model";

export class GetFinanceBudgetSettingsService {
  constructor(
    private getFinanceBudgetSettingsPort: GetFinanceBudgetSettingsPort,
  ) {}

  getFinanceBudgetSettings(): Observable<GetFinanceBudgetSettingsResponse> {
    return this.getFinanceBudgetSettingsPort.getFinanceBudgetSettings();
  }
}
