import { Observable } from "rxjs";
import { WorkoutDetailResponse } from "../models/workout-detail.model";

export abstract class GetWorkoutPort {
  abstract getWorkout(id: string): Observable<WorkoutDetailResponse>;
}
