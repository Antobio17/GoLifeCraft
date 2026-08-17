import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateFinanceAccountPort } from "../../domain/ports/create-finance-account.port";
import { FinanceAccountPayload } from "../../domain/models/finance-account-payload.model";

@Injectable()
export class HttpCreateFinanceAccountAdapter extends CreateFinanceAccountPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/accounts";

  createFinanceAccount(payload: FinanceAccountPayload): Observable<void> {
    return this.http.post<void>(this.apiUrl, payload);
  }
}
