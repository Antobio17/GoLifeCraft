import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteFinanceTransactionPort } from "../../domain/ports/delete-finance-transaction.port";

@Injectable()
export class HttpDeleteFinanceTransactionAdapter extends DeleteFinanceTransactionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/transactions";

  deleteFinanceTransaction(financeTransactionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${financeTransactionId}`);
  }
}
