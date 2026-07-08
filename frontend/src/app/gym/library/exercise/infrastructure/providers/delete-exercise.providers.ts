import { Provider } from "@angular/core";
import { DeleteExercisePort } from "@gym/library/exercise/domain/ports/delete-exercise.port";
import { HttpDeleteExerciseAdapter } from "@gym/library/exercise/infrastructure/adapters/http-delete-exercise.adapter";
import { DeleteExerciseService } from "@gym/library/exercise/application/services/delete-exercise.service";

export class DeleteExerciseProviders {
  static getProviders(): Provider[] {
    return [
      { provide: DeleteExercisePort, useClass: HttpDeleteExerciseAdapter },
      {
        provide: DeleteExerciseService,
        useFactory: (port: DeleteExercisePort) =>
          new DeleteExerciseService(port),
        deps: [DeleteExercisePort],
      },
    ];
  }
}
