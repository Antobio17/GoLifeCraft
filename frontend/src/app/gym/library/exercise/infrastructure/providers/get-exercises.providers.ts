import { Provider } from "@angular/core";
import { GetExercisesPort } from "@gym/library/exercise/domain/ports/get-exercises.port";
import { HttpGetExercisesAdapter } from "@gym/library/exercise/infrastructure/adapters/http-get-exercises.adapter";
import { GetExercisesService } from "@gym/library/exercise/application/services/get-exercises.service";

export class GetExercisesProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetExercisesPort, useClass: HttpGetExercisesAdapter },
      {
        provide: GetExercisesService,
        useFactory: (port: GetExercisesPort) => new GetExercisesService(port),
        deps: [GetExercisesPort],
      },
    ];
  }
}
