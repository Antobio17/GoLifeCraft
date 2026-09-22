import { Provider } from "@angular/core";
import { EditWorkoutPort } from "@gym/training/workout/domain/ports/edit-workout.port";
import { HttpEditWorkoutAdapter } from "@gym/training/workout/infrastructure/adapters/http-edit-workout.adapter";
import { EditWorkoutService } from "@gym/training/workout/application/services/edit-workout.service";

export class EditWorkoutProviders {
  static getProviders(): Provider[] {
    return [
      { provide: EditWorkoutPort, useClass: HttpEditWorkoutAdapter },
      {
        provide: EditWorkoutService,
        useFactory: (port: EditWorkoutPort) => new EditWorkoutService(port),
        deps: [EditWorkoutPort],
      },
    ];
  }
}
