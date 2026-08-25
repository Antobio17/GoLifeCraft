import { Observable } from "rxjs";
import { SaveSessionExerciseRequest } from "../models/session-exercise-request.model";

export abstract class SaveSessionExercisePort {
  abstract addSessionExercise(
    sessionId: string,
    sessionExerciseId: string,
    request: SaveSessionExerciseRequest,
  ): Observable<void>;

  abstract updateSessionExercise(
    sessionId: string,
    sessionExerciseId: string,
    request: SaveSessionExerciseRequest,
  ): Observable<void>;

  abstract reorderSessionExercises(
    sessionId: string,
    orderedSessionExerciseIds: string[],
  ): Observable<void>;

  abstract removeSessionExercise(
    sessionId: string,
    sessionExerciseId: string,
  ): Observable<void>;
}
