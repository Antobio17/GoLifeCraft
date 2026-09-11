import { Provider } from "@angular/core";
import { GetExerciseTopSetsPort } from "@gym/library/exercise/domain/ports/get-exercise-top-sets.port";
import { HttpGetExerciseTopSetsAdapter } from "@gym/library/exercise/infrastructure/adapters/http-get-exercise-top-sets.adapter";
import { GetExerciseTopSetsService } from "@gym/library/exercise/application/services/get-exercise-top-sets.service";

export class GetExerciseTopSetsProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetExerciseTopSetsPort,
        useClass: HttpGetExerciseTopSetsAdapter,
      },
      {
        provide: GetExerciseTopSetsService,
        useFactory: (port: GetExerciseTopSetsPort) =>
          new GetExerciseTopSetsService(port),
        deps: [GetExerciseTopSetsPort],
      },
    ];
  }
}
