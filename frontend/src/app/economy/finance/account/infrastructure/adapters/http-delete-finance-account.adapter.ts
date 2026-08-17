import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteFinanceAccountPort } from "../../domain/ports/delete-finance-account.port";

@Injectable()
export class HttpDeleteFinanceAccountAdapter extends DeleteFinanceAccountPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/accounts";

  deleteFinanceAccount(financeAccountId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${financeAccountId}`);
  }
}
