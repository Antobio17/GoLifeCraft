import { Observable } from "rxjs";
import { GetFinanceOverviewResponse } from "../models/get-finance-overview-response.model";

export abstract class GetFinanceOverviewPort {
  abstract getFinanceOverview(
    month: string,
  ): Observable<GetFinanceOverviewResponse>;
}
