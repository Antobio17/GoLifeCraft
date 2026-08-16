import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateFinanceTransactionPort } from "../../domain/ports/update-finance-transaction.port";
import { FinanceTransactionPayload } from "../../domain/models/finance-transaction-payload.model";

@Injectable()
export class HttpUpdateFinanceTransactionAdapter extends UpdateFinanceTransactionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/transactions";

  updateFinanceTransaction(
    financeTransactionId: string,
    payload: FinanceTransactionPayload,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${financeTransactionId}`,
      payload,
    );
  }
}
