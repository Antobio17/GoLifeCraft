import { Observable } from "rxjs";
import {
  StartWorkoutRequest,
  WorkoutProgressRequest,
} from "../models/workout-request.model";
import {
  StartWorkoutResponse,
  WorkoutDetail,
} from "../models/workout-detail.model";

export abstract class WorkoutSessionPort {
  abstract start(
    request: StartWorkoutRequest,
  ): Observable<StartWorkoutResponse>;

  abstract updateProgress(
    workoutId: string,
    request: WorkoutProgressRequest,
  ): Observable<void>;

  abstract finish(
    workoutId: string,
    request: WorkoutProgressRequest,
  ): Observable<void>;

  abstract discard(workoutId: string): Observable<void>;

  abstract getActive(): Observable<WorkoutDetail | null>;
}
