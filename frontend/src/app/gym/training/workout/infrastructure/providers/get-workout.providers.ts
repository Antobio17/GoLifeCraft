import { Provider } from "@angular/core";
import { GetWorkoutPort } from "@gym/training/workout/domain/ports/get-workout.port";
import { HttpGetWorkoutAdapter } from "@gym/training/workout/infrastructure/adapters/http-get-workout.adapter";
import { GetWorkoutService } from "@gym/training/workout/application/services/get-workout.service";

export class GetWorkoutProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetWorkoutPort, useClass: HttpGetWorkoutAdapter },
      {
        provide: GetWorkoutService,
        useFactory: (port: GetWorkoutPort) => new GetWorkoutService(port),
        deps: [GetWorkoutPort],
      },
    ];
  }
}
