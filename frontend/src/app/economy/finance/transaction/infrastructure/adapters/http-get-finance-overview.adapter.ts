import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetFinanceOverviewPort } from "../../domain/ports/get-finance-overview.port";
import { GetFinanceOverviewResponse } from "../../domain/models/get-finance-overview-response.model";

@Injectable()
export class HttpGetFinanceOverviewAdapter extends GetFinanceOverviewPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/economy/overview";

  getFinanceOverview(month: string): Observable<GetFinanceOverviewResponse> {
    const params = new HttpParams().set("month", month);

    return this.http.get<GetFinanceOverviewResponse>(this.apiUrl, { params });
  }
}
