import { Provider } from "@angular/core";
import { RemoveTicketItemPort } from "@nutrition/shopping/ticket/domain/ports/remove-ticket-item.port";
import { HttpRemoveTicketItemAdapter } from "@nutrition/shopping/ticket/infrastructure/adapters/http-remove-ticket-item.adapter";
import { RemoveTicketItemService } from "@nutrition/shopping/ticket/application/services/remove-ticket-item.service";

export class RemoveTicketItemProviders {
  static getProviders(): Provider[] {
    return [
      { provide: RemoveTicketItemPort, useClass: HttpRemoveTicketItemAdapter },
      {
        provide: RemoveTicketItemService,
        useFactory: (port: RemoveTicketItemPort) =>
          new RemoveTicketItemService(port),
        deps: [RemoveTicketItemPort],
      },
    ];
  }
}
