import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SaveSessionExercisePort } from "../../domain/ports/save-session-exercise.port";
import { SaveSessionExerciseRequest } from "../../domain/models/session-exercise-request.model";

@Injectable()
export class HttpSaveSessionExerciseAdapter extends SaveSessionExercisePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/session";

  addSessionExercise(
    sessionId: string,
    sessionExerciseId: string,
    request: SaveSessionExerciseRequest,
  ): Observable<void> {
    return this.http.put<void>(
      this.exerciseUrl(sessionId, sessionExerciseId),
      request,
    );
  }

  updateSessionExercise(
    sessionId: string,
    sessionExerciseId: string,
    request: SaveSessionExerciseRequest,
  ): Observable<void> {
    return this.http.patch<void>(
      this.exerciseUrl(sessionId, sessionExerciseId),
      request,
    );
  }

  removeSessionExercise(
    sessionId: string,
    sessionExerciseId: string,
  ): Observable<void> {
    return this.http.delete<void>(
      this.exerciseUrl(sessionId, sessionExerciseId),
    );
  }

  private exerciseUrl(sessionId: string, sessionExerciseId: string): string {
    return `${this.apiUrl}/${sessionId}/exercise/${sessionExerciseId}`;
  }
}
