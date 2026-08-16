import { Observable } from "rxjs";
import { GetFinanceOverviewPort } from "../../domain/ports/get-finance-overview.port";
import { GetFinanceOverviewResponse } from "../../domain/models/get-finance-overview-response.model";

export class GetFinanceOverviewService {
  constructor(private getFinanceOverviewPort: GetFinanceOverviewPort) {}

  getFinanceOverview(month: string): Observable<GetFinanceOverviewResponse> {
    return this.getFinanceOverviewPort.getFinanceOverview(month);
  }
}
