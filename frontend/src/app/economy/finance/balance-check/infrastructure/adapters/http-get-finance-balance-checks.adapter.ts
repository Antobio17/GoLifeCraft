import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetFinanceBalanceChecksPort } from "../../domain/ports/get-finance-balance-checks.port";
import { GetFinanceBalanceChecksResponse } from "../../domain/models/get-finance-balance-checks-response.model";

@Injectable()
export class HttpGetFinanceBalanceChecksAdapter extends GetFinanceBalanceChecksPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/balance-checks";

  getFinanceBalanceChecks(
    accountId?: string,
  ): Observable<GetFinanceBalanceChecksResponse> {
    let params = new HttpParams();

    if (accountId) {
      params = params.set("accountId", accountId);
    }

    return this.http.get<GetFinanceBalanceChecksResponse>(this.apiUrl, {
      params,
    });
  }
}
