import { Provider } from "@angular/core";
import { GetSessionsPort } from "@gym/training/session/domain/ports/get-sessions.port";
import { HttpGetSessionsAdapter } from "@gym/training/session/infrastructure/adapters/http-get-sessions.adapter";
import { GetSessionsService } from "@gym/training/session/application/services/get-sessions.service";

export class GetSessionsProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetSessionsPort, useClass: HttpGetSessionsAdapter },
      {
        provide: GetSessionsService,
        useFactory: (port: GetSessionsPort) => new GetSessionsService(port),
        deps: [GetSessionsPort],
      },
    ];
  }
}
