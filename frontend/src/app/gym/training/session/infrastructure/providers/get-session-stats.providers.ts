import { Provider } from "@angular/core";
import { GetSessionStatsPort } from "@gym/training/session/domain/ports/get-session-stats.port";
import { HttpGetSessionStatsAdapter } from "@gym/training/session/infrastructure/adapters/http-get-session-stats.adapter";
import { GetSessionStatsService } from "@gym/training/session/application/services/get-session-stats.service";

export class GetSessionStatsProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetSessionStatsPort, useClass: HttpGetSessionStatsAdapter },
      {
        provide: GetSessionStatsService,
        useFactory: (port: GetSessionStatsPort) =>
          new GetSessionStatsService(port),
        deps: [GetSessionStatsPort],
      },
    ];
  }
}
