import { Observable } from "rxjs";
import { SaveSessionExercisePort } from "../../domain/ports/save-session-exercise.port";
import { SaveSessionExerciseRequest } from "../../domain/models/session-exercise-request.model";

export class SaveSessionExerciseService {
  constructor(private saveSessionExercisePort: SaveSessionExercisePort) {}

  addSessionExercise(
    sessionId: string,
    sessionExerciseId: string,
    request: SaveSessionExerciseRequest,
  ): Observable<void> {
    return this.saveSessionExercisePort.addSessionExercise(
      sessionId,
      sessionExerciseId,
      request,
    );
  }

  updateSessionExercise(
    sessionId: string,
    sessionExerciseId: string,
    request: SaveSessionExerciseRequest,
  ): Observable<void> {
    return this.saveSessionExercisePort.updateSessionExercise(
      sessionId,
      sessionExerciseId,
      request,
    );
  }

  reorderSessionExercises(
    sessionId: string,
    orderedSessionExerciseIds: string[],
  ): Observable<void> {
    return this.saveSessionExercisePort.reorderSessionExercises(
      sessionId,
      orderedSessionExerciseIds,
    );
  }

  removeSessionExercise(
    sessionId: string,
    sessionExerciseId: string,
  ): Observable<void> {
    return this.saveSessionExercisePort.removeSessionExercise(
      sessionId,
      sessionExerciseId,
    );
  }
}
