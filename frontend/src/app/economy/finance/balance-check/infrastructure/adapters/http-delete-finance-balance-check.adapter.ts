import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteFinanceBalanceCheckPort } from "../../domain/ports/delete-finance-balance-check.port";

@Injectable()
export class HttpDeleteFinanceBalanceCheckAdapter extends DeleteFinanceBalanceCheckPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/balance-checks";

  deleteFinanceBalanceCheck(financeBalanceCheckId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${financeBalanceCheckId}`);
  }
}
