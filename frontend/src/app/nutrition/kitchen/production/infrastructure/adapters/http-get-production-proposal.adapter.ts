import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetProductionProposalPort } from "../../domain/ports/get-production-proposal.port";
import { GetProductionProposalResponse } from "../../domain/models/get-production-proposal-response.model";

@Injectable()
export class HttpGetProductionProposalAdapter extends GetProductionProposalPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/proposal";

  getProductionProposal(
    fromDate: string,
    toDate: string,
  ): Observable<GetProductionProposalResponse> {
    const params = new HttpParams().set("from", fromDate).set("to", toDate);

    return this.http.get<GetProductionProposalResponse>(this.apiUrl, {
      params,
    });
  }
}
