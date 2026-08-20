import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetFinanceBudgetSettingsPort } from "../../domain/ports/get-finance-budget-settings.port";
import { GetFinanceBudgetSettingsResponse } from "../../domain/models/get-finance-budget-settings-response.model";

@Injectable()
export class HttpGetFinanceBudgetSettingsAdapter extends GetFinanceBudgetSettingsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/budget/settings";

  getFinanceBudgetSettings(): Observable<GetFinanceBudgetSettingsResponse> {
    return this.http.get<GetFinanceBudgetSettingsResponse>(this.apiUrl);
  }
}
