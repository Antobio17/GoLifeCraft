import { Provider } from "@angular/core";
import { GetTicketDraftPort } from "@nutrition/shopping/ticket/domain/ports/get-ticket-draft.port";
import { HttpGetTicketDraftAdapter } from "@nutrition/shopping/ticket/infrastructure/adapters/http-get-ticket-draft.adapter";
import { GetTicketDraftService } from "@nutrition/shopping/ticket/application/services/get-ticket-draft.service";

export class GetTicketDraftProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetTicketDraftPort, useClass: HttpGetTicketDraftAdapter },
      {
        provide: GetTicketDraftService,
        useFactory: (port: GetTicketDraftPort) =>
          new GetTicketDraftService(port),
        deps: [GetTicketDraftPort],
      },
    ];
  }
}
