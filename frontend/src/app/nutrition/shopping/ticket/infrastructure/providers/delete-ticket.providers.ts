import { Provider } from "@angular/core";
import { DeleteTicketPort } from "@nutrition/shopping/ticket/domain/ports/delete-ticket.port";
import { HttpDeleteTicketAdapter } from "@nutrition/shopping/ticket/infrastructure/adapters/http-delete-ticket.adapter";
import { DeleteTicketService } from "@nutrition/shopping/ticket/application/services/delete-ticket.service";

export class DeleteTicketProviders {
  static getProviders(): Provider[] {
    return [
      { provide: DeleteTicketPort, useClass: HttpDeleteTicketAdapter },
      {
        provide: DeleteTicketService,
        useFactory: (port: DeleteTicketPort) => new DeleteTicketService(port),
        deps: [DeleteTicketPort],
      },
    ];
  }
}
