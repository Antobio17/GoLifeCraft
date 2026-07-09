import { Provider } from "@angular/core";
import { GetWorkoutsPort } from "@gym/training/workout/domain/ports/get-workouts.port";
import { HttpGetWorkoutsAdapter } from "@gym/training/workout/infrastructure/adapters/http-get-workouts.adapter";
import { GetWorkoutsService } from "@gym/training/workout/application/services/get-workouts.service";

export class GetWorkoutsProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetWorkoutsPort, useClass: HttpGetWorkoutsAdapter },
      {
        provide: GetWorkoutsService,
        useFactory: (port: GetWorkoutsPort) => new GetWorkoutsService(port),
        deps: [GetWorkoutsPort],
      },
    ];
  }
}
