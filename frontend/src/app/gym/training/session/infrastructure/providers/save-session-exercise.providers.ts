import { Provider } from "@angular/core";
import { SaveSessionExercisePort } from "@gym/training/session/domain/ports/save-session-exercise.port";
import { HttpSaveSessionExerciseAdapter } from "@gym/training/session/infrastructure/adapters/http-save-session-exercise.adapter";
import { SaveSessionExerciseService } from "@gym/training/session/application/services/save-session-exercise.service";

export class SaveSessionExerciseProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: SaveSessionExercisePort,
        useClass: HttpSaveSessionExerciseAdapter,
      },
      {
        provide: SaveSessionExerciseService,
        useFactory: (port: SaveSessionExercisePort) =>
          new SaveSessionExerciseService(port),
        deps: [SaveSessionExercisePort],
      },
    ];
  }
}
