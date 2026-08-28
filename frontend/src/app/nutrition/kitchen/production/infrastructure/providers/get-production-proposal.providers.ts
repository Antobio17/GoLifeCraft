import { Provider } from "@angular/core";
import { GetProductionProposalPort } from "@nutrition/kitchen/production/domain/ports/get-production-proposal.port";
import { HttpGetProductionProposalAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-get-production-proposal.adapter";
import { GetProductionProposalService } from "@nutrition/kitchen/production/application/services/get-production-proposal.service";

export class GetProductionProposalProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetProductionProposalPort,
        useClass: HttpGetProductionProposalAdapter,
      },
      {
        provide: GetProductionProposalService,
        useFactory: (port: GetProductionProposalPort) =>
          new GetProductionProposalService(port),
        deps: [GetProductionProposalPort],
      },
    ];
  }
}
