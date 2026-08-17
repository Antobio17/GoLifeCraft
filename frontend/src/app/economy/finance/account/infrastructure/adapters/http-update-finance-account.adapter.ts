import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateFinanceAccountPort } from "../../domain/ports/update-finance-account.port";
import { FinanceAccountPayload } from "../../domain/models/finance-account-payload.model";

@Injectable()
export class HttpUpdateFinanceAccountAdapter extends UpdateFinanceAccountPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/accounts";

  updateFinanceAccount(
    financeAccountId: string,
    payload: FinanceAccountPayload,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${financeAccountId}`, payload);
  }
}
