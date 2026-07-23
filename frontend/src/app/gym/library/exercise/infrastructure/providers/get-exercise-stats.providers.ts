import { Provider } from "@angular/core";
import { GetExerciseStatsPort } from "@gym/library/exercise/domain/ports/get-exercise-stats.port";
import { HttpGetExerciseStatsAdapter } from "@gym/library/exercise/infrastructure/adapters/http-get-exercise-stats.adapter";
import { GetExerciseStatsService } from "@gym/library/exercise/application/services/get-exercise-stats.service";

export class GetExerciseStatsProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetExerciseStatsPort, useClass: HttpGetExerciseStatsAdapter },
      {
        provide: GetExerciseStatsService,
        useFactory: (port: GetExerciseStatsPort) =>
          new GetExerciseStatsService(port),
        deps: [GetExerciseStatsPort],
      },
    ];
  }
}
