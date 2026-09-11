import { Provider } from "@angular/core";
import { LinkTicketItemPort } from "@nutrition/shopping/ticket/domain/ports/link-ticket-item.port";
import { HttpLinkTicketItemAdapter } from "@nutrition/shopping/ticket/infrastructure/adapters/http-link-ticket-item.adapter";
import { LinkTicketItemService } from "@nutrition/shopping/ticket/application/services/link-ticket-item.service";

export class LinkTicketItemProviders {
  static getProviders(): Provider[] {
    return [
      { provide: LinkTicketItemPort, useClass: HttpLinkTicketItemAdapter },
      {
        provide: LinkTicketItemService,
        useFactory: (port: LinkTicketItemPort) =>
          new LinkTicketItemService(port),
        deps: [LinkTicketItemPort],
      },
    ];
  }
}
