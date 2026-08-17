import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateFinanceBalanceCheckPort } from "../../domain/ports/create-finance-balance-check.port";
import { FinanceBalanceCheckPayload } from "../../domain/models/finance-balance-check-payload.model";

@Injectable()
export class HttpCreateFinanceBalanceCheckAdapter extends CreateFinanceBalanceCheckPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/balance-checks";

  createFinanceBalanceCheck(
    payload: FinanceBalanceCheckPayload,
  ): Observable<void> {
    return this.http.post<void>(this.apiUrl, payload);
  }
}
