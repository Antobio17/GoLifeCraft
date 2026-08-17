import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SetFinanceAccountBalancePort } from "../../domain/ports/set-finance-account-balance.port";
import { FinanceAccountBalancePayload } from "../../domain/models/finance-account-balance-payload.model";

@Injectable()
export class HttpSetFinanceAccountBalanceAdapter extends SetFinanceAccountBalancePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/accounts";

  setFinanceAccountBalance(
    financeAccountId: string,
    payload: FinanceAccountBalancePayload,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${financeAccountId}/balance`,
      payload,
    );
  }
}
