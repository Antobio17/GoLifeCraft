import { Provider } from "@angular/core";
import { WorkoutSessionPort } from "@gym/training/workout/domain/ports/workout-session.port";
import { HttpWorkoutSessionAdapter } from "@gym/training/workout/infrastructure/adapters/http-workout-session.adapter";
import { ActiveWorkoutService } from "@gym/training/workout/application/services/active-workout.service";

export class WorkoutSessionProviders {
  static getProviders(): Provider[] {
    return [
      { provide: WorkoutSessionPort, useClass: HttpWorkoutSessionAdapter },
      ActiveWorkoutService,
    ];
  }
}
