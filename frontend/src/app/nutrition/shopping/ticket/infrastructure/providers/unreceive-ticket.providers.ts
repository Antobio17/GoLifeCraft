import { Provider } from "@angular/core";
import { UnreceiveTicketPort } from "@nutrition/shopping/ticket/domain/ports/unreceive-ticket.port";
import { HttpUnreceiveTicketAdapter } from "@nutrition/shopping/ticket/infrastructure/adapters/http-unreceive-ticket.adapter";
import { UnreceiveTicketService } from "@nutrition/shopping/ticket/application/services/unreceive-ticket.service";

export class UnreceiveTicketProviders {
  static getProviders(): Provider[] {
    return [
      { provide: UnreceiveTicketPort, useClass: HttpUnreceiveTicketAdapter },
      {
        provide: UnreceiveTicketService,
        useFactory: (port: UnreceiveTicketPort) =>
          new UnreceiveTicketService(port),
        deps: [UnreceiveTicketPort],
      },
    ];
  }
}
