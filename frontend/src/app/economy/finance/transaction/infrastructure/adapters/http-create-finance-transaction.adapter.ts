import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateFinanceTransactionPort } from "../../domain/ports/create-finance-transaction.port";
import { FinanceTransactionPayload } from "../../domain/models/finance-transaction-payload.model";

@Injectable()
export class HttpCreateFinanceTransactionAdapter extends CreateFinanceTransactionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/transactions";

  createFinanceTransaction(
    payload: FinanceTransactionPayload,
  ): Observable<void> {
    return this.http.post<void>(this.apiUrl, payload);
  }
}
