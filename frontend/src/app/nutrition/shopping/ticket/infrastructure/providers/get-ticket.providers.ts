import { Provider } from "@angular/core";
import { GetTicketPort } from "@nutrition/shopping/ticket/domain/ports/get-ticket.port";
import { HttpGetTicketAdapter } from "@nutrition/shopping/ticket/infrastructure/adapters/http-get-ticket.adapter";
import { GetTicketService } from "@nutrition/shopping/ticket/application/services/get-ticket.service";

export class GetTicketProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetTicketPort, useClass: HttpGetTicketAdapter },
      {
        provide: GetTicketService,
        useFactory: (port: GetTicketPort) => new GetTicketService(port),
        deps: [GetTicketPort],
      },
    ];
  }
}
