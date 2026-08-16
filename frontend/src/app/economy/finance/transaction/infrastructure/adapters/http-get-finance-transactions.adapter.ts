import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetFinanceTransactionsPort } from "../../domain/ports/get-finance-transactions.port";
import { GetFinanceTransactionsResponse } from "../../domain/models/get-finance-transactions-response.model";

@Injectable()
export class HttpGetFinanceTransactionsAdapter extends GetFinanceTransactionsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/transactions";

  getFinanceTransactions(
    month: string,
    date?: string,
  ): Observable<GetFinanceTransactionsResponse> {
    let params = new HttpParams().set("month", month);

    if (date) {
      params = params.set("date", date);
    }

    return this.http.get<GetFinanceTransactionsResponse>(this.apiUrl, {
      params,
    });
  }
}
