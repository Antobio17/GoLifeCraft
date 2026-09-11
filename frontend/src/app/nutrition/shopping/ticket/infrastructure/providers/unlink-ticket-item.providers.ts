import { Provider } from "@angular/core";
import { UnlinkTicketItemPort } from "@nutrition/shopping/ticket/domain/ports/unlink-ticket-item.port";
import { HttpUnlinkTicketItemAdapter } from "@nutrition/shopping/ticket/infrastructure/adapters/http-unlink-ticket-item.adapter";
import { UnlinkTicketItemService } from "@nutrition/shopping/ticket/application/services/unlink-ticket-item.service";

export class UnlinkTicketItemProviders {
  static getProviders(): Provider[] {
    return [
      { provide: UnlinkTicketItemPort, useClass: HttpUnlinkTicketItemAdapter },
      {
        provide: UnlinkTicketItemService,
        useFactory: (port: UnlinkTicketItemPort) =>
          new UnlinkTicketItemService(port),
        deps: [UnlinkTicketItemPort],
      },
    ];
  }
}
