import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetFinanceBudgetPort } from "../../domain/ports/get-finance-budget.port";
import { GetFinanceBudgetResponse } from "../../domain/models/get-finance-budget-response.model";

@Injectable()
export class HttpGetFinanceBudgetAdapter extends GetFinanceBudgetPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/budget";

  getFinanceBudget(month: string): Observable<GetFinanceBudgetResponse> {
    const params = new HttpParams().set("month", month);

    return this.http.get<GetFinanceBudgetResponse>(this.apiUrl, { params });
  }
}
