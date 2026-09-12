import { Provider } from "@angular/core";
import { CreateTicketPort } from "@nutrition/shopping/ticket/domain/ports/create-ticket.port";
import { HttpCreateTicketAdapter } from "@nutrition/shopping/ticket/infrastructure/adapters/http-create-ticket.adapter";
import { CreateTicketService } from "@nutrition/shopping/ticket/application/services/create-ticket.service";

export class CreateTicketProviders {
  static getProviders(): Provider[] {
    return [
      { provide: CreateTicketPort, useClass: HttpCreateTicketAdapter },
      {
        provide: CreateTicketService,
        useFactory: (port: CreateTicketPort) => new CreateTicketService(port),
        deps: [CreateTicketPort],
      },
    ];
  }
}
