import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SaveFinanceBudgetPort } from "../../domain/ports/save-finance-budget.port";
import { FinanceBudgetPayload } from "../../domain/models/finance-budget-payload.model";

@Injectable()
export class HttpSaveFinanceBudgetAdapter extends SaveFinanceBudgetPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/budget";

  saveFinanceBudget(payload: FinanceBudgetPayload): Observable<void> {
    return this.http.put<void>(this.apiUrl, payload);
  }
}
