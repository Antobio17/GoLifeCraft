import { Provider } from "@angular/core";
import { UpdateTicketItemPort } from "@nutrition/shopping/ticket/domain/ports/update-ticket-item.port";
import { HttpUpdateTicketItemAdapter } from "@nutrition/shopping/ticket/infrastructure/adapters/http-update-ticket-item.adapter";
import { UpdateTicketItemService } from "@nutrition/shopping/ticket/application/services/update-ticket-item.service";

export class UpdateTicketItemProviders {
  static getProviders(): Provider[] {
    return [
      { provide: UpdateTicketItemPort, useClass: HttpUpdateTicketItemAdapter },
      {
        provide: UpdateTicketItemService,
        useFactory: (port: UpdateTicketItemPort) =>
          new UpdateTicketItemService(port),
        deps: [UpdateTicketItemPort],
      },
    ];
  }
}
