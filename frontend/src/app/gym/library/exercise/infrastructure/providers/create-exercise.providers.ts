import { Provider } from "@angular/core";
import { CreateExercisePort } from "@gym/library/exercise/domain/ports/create-exercise.port";
import { HttpCreateExerciseAdapter } from "@gym/library/exercise/infrastructure/adapters/http-create-exercise.adapter";
import { CreateExerciseService } from "@gym/library/exercise/application/services/create-exercise.service";

export class CreateExerciseProviders {
  static getProviders(): Provider[] {
    return [
      { provide: CreateExercisePort, useClass: HttpCreateExerciseAdapter },
      {
        provide: CreateExerciseService,
        useFactory: (port: CreateExercisePort) =>
          new CreateExerciseService(port),
        deps: [CreateExercisePort],
      },
    ];
  }
}
