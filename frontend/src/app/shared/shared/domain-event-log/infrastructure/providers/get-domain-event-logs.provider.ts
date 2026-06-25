import { Provider } from "@angular/core";
import { HttpGetDomainEventLogsAdapter } from "../adapters/http-get-domain-event-logs.adapter";
import { GetDomainEventLogsPort } from "../../domain/ports/get-domain-event-logs.port";
import { GetDomainEventLogsService } from "../../application/services/get-domain-event-logs.service";

export class GetDomainEventLogsProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetDomainEventLogsPort,
        useClass: HttpGetDomainEventLogsAdapter,
      },
      {
        provide: GetDomainEventLogsService,
        useFactory: (port: GetDomainEventLogsPort) =>
          new GetDomainEventLogsService(port),
        deps: [GetDomainEventLogsPort],
      },
    ];
  }
}
