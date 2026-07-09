import { Observable } from "rxjs";
import { GetWorkoutPort } from "../../domain/ports/get-workout.port";
import { WorkoutDetailResponse } from "../../domain/models/workout-detail.model";

export class GetWorkoutService {
  constructor(private getWorkoutPort: GetWorkoutPort) {}

  getWorkout(id: string): Observable<WorkoutDetailResponse> {
    return this.getWorkoutPort.getWorkout(id);
  }
}
