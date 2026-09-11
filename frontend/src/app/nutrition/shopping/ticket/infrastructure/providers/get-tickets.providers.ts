import { Provider } from "@angular/core";
import { GetTicketsPort } from "@nutrition/shopping/ticket/domain/ports/get-tickets.port";
import { HttpGetTicketsAdapter } from "@nutrition/shopping/ticket/infrastructure/adapters/http-get-tickets.adapter";
import { GetTicketsService } from "@nutrition/shopping/ticket/application/services/get-tickets.service";

export class GetTicketsProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetTicketsPort, useClass: HttpGetTicketsAdapter },
      {
        provide: GetTicketsService,
        useFactory: (port: GetTicketsPort) => new GetTicketsService(port),
        deps: [GetTicketsPort],
      },
    ];
  }
}
