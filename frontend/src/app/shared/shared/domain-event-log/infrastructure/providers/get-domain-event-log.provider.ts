import { Provider } from "@angular/core";
import { HttpGetDomainEventLogAdapter } from "../adapters/http-get-domain-event-log.adapter";
import { GetDomainEventLogPort } from "../../domain/ports/get-domain-event-log.port";
import { GetDomainEventLogService } from "../../application/services/get-domain-event-log.service";

export class GetDomainEventLogProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetDomainEventLogPort,
        useClass: HttpGetDomainEventLogAdapter,
      },
      {
        provide: GetDomainEventLogService,
        useFactory: (port: GetDomainEventLogPort) =>
          new GetDomainEventLogService(port),
        deps: [GetDomainEventLogPort],
      },
    ];
  }
}
