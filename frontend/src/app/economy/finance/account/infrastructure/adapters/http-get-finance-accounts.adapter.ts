import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetFinanceAccountsPort } from "../../domain/ports/get-finance-accounts.port";
import { GetFinanceAccountsResponse } from "../../domain/models/get-finance-accounts-response.model";

@Injectable()
export class HttpGetFinanceAccountsAdapter extends GetFinanceAccountsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/accounts";

  getFinanceAccounts(): Observable<GetFinanceAccountsResponse> {
    return this.http.get<GetFinanceAccountsResponse>(this.apiUrl);
  }
}
