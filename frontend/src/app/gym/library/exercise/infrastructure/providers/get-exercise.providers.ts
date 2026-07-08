import { Provider } from "@angular/core";
import { GetExercisePort } from "@gym/library/exercise/domain/ports/get-exercise.port";
import { HttpGetExerciseAdapter } from "@gym/library/exercise/infrastructure/adapters/http-get-exercise.adapter";
import { GetExerciseService } from "@gym/library/exercise/application/services/get-exercise.service";

export class GetExerciseProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetExercisePort, useClass: HttpGetExerciseAdapter },
      {
        provide: GetExerciseService,
        useFactory: (port: GetExercisePort) => new GetExerciseService(port),
        deps: [GetExercisePort],
      },
    ];
  }
}
