import { Observable } from "rxjs";
import { GetFinanceTransactionsPort } from "../../domain/ports/get-finance-transactions.port";
import { GetFinanceTransactionsResponse } from "../../domain/models/get-finance-transactions-response.model";

export class GetFinanceTransactionsService {
  constructor(private getFinanceTransactionsPort: GetFinanceTransactionsPort) {}

  getFinanceTransactions(
    month: string,
    date?: string,
  ): Observable<GetFinanceTransactionsResponse> {
    return this.getFinanceTransactionsPort.getFinanceTransactions(month, date);
  }
}
