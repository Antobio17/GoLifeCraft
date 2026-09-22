import { Observable } from "rxjs";
import { EditWorkoutPort } from "../../domain/ports/edit-workout.port";
import { EditWorkoutRequest } from "../../domain/models/edit-workout-request.model";

export class EditWorkoutService {
  constructor(private editWorkoutPort: EditWorkoutPort) {}

  editWorkout(
    workoutId: string,
    request: EditWorkoutRequest,
  ): Observable<void> {
    return this.editWorkoutPort.editWorkout(workoutId, request);
  }
}
