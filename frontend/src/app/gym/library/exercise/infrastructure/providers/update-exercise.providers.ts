import { Provider } from "@angular/core";
import { UpdateExercisePort } from "@gym/library/exercise/domain/ports/update-exercise.port";
import { HttpUpdateExerciseAdapter } from "@gym/library/exercise/infrastructure/adapters/http-update-exercise.adapter";
import { UpdateExerciseService } from "@gym/library/exercise/application/services/update-exercise.service";

export class UpdateExerciseProviders {
  static getProviders(): Provider[] {
    return [
      { provide: UpdateExercisePort, useClass: HttpUpdateExerciseAdapter },
      {
        provide: UpdateExerciseService,
        useFactory: (port: UpdateExercisePort) =>
          new UpdateExerciseService(port),
        deps: [UpdateExercisePort],
      },
    ];
  }
}
