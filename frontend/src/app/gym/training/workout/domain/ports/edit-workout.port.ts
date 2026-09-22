import { Observable } from "rxjs";
import { EditWorkoutRequest } from "../models/edit-workout-request.model";

export abstract class EditWorkoutPort {
  abstract editWorkout(
    workoutId: string,
    request: EditWorkoutRequest,
  ): Observable<void>;
}
