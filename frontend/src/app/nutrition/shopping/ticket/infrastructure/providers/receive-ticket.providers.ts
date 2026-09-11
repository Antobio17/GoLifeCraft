import { Provider } from "@angular/core";
import { ReceiveTicketPort } from "@nutrition/shopping/ticket/domain/ports/receive-ticket.port";
import { HttpReceiveTicketAdapter } from "@nutrition/shopping/ticket/infrastructure/adapters/http-receive-ticket.adapter";
import { ReceiveTicketService } from "@nutrition/shopping/ticket/application/services/receive-ticket.service";

export class ReceiveTicketProviders {
  static getProviders(): Provider[] {
    return [
      { provide: ReceiveTicketPort, useClass: HttpReceiveTicketAdapter },
      {
        provide: ReceiveTicketService,
        useFactory: (port: ReceiveTicketPort) => new ReceiveTicketService(port),
        deps: [ReceiveTicketPort],
      },
    ];
  }
}
