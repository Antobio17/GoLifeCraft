import { Provider } from "@angular/core";
import { GetGymStatsPort } from "@gym/analytics/stats/domain/ports/get-gym-stats.port";
import { HttpGetGymStatsAdapter } from "@gym/analytics/stats/infrastructure/adapters/http-get-gym-stats.adapter";
import { GetGymStatsService } from "@gym/analytics/stats/application/services/get-gym-stats.service";

export class GetGymStatsProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetGymStatsPort, useClass: HttpGetGymStatsAdapter },
      {
        provide: GetGymStatsService,
        useFactory: (port: GetGymStatsPort) => new GetGymStatsService(port),
        deps: [GetGymStatsPort],
      },
    ];
  }
}
