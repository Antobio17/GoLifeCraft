import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateFinanceBalanceCheckPort } from "../../domain/ports/update-finance-balance-check.port";
import { FinanceBalanceCheckPayload } from "../../domain/models/finance-balance-check-payload.model";

@Injectable()
export class HttpUpdateFinanceBalanceCheckAdapter extends UpdateFinanceBalanceCheckPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/balance-checks";

  updateFinanceBalanceCheck(
    financeBalanceCheckId: string,
    payload: FinanceBalanceCheckPayload,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${financeBalanceCheckId}`,
      payload,
    );
  }
}
