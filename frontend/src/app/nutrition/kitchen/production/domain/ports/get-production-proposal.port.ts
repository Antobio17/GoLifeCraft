import { Observable } from "rxjs";
import { GetProductionProposalResponse } from "../models/get-production-proposal-response.model";

export abstract class GetProductionProposalPort {
  abstract getProductionProposal(
    fromDate: string,
    toDate: string,
  ): Observable<GetProductionProposalResponse>;
}
