import { Observable } from "rxjs";
import { GetFinanceTransactionsResponse } from "../models/get-finance-transactions-response.model";

export abstract class GetFinanceTransactionsPort {
  abstract getFinanceTransactions(
    month: string,
    date?: string,
  ): Observable<GetFinanceTransactionsResponse>;
}
