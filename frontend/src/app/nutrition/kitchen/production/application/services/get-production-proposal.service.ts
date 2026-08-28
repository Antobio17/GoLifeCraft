import { Observable } from "rxjs";
import { GetProductionProposalPort } from "../../domain/ports/get-production-proposal.port";
import { GetProductionProposalResponse } from "../../domain/models/get-production-proposal-response.model";

export class GetProductionProposalService {
  constructor(private getProductionProposalPort: GetProductionProposalPort) {}

  getProductionProposal(
    fromDate: string,
    toDate: string,
  ): Observable<GetProductionProposalResponse> {
    return this.getProductionProposalPort.getProductionProposal(
      fromDate,
      toDate,
    );
  }
}
