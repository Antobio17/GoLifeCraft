import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { WorkoutSessionPort } from "../../domain/ports/workout-session.port";
import {
  StartWorkoutRequest,
  WorkoutProgressRequest,
} from "../../domain/models/workout-request.model";
import {
  WorkoutDetail,
  WorkoutDetailResponse,
} from "../../domain/models/workout-detail.model";

@Injectable()
export class HttpWorkoutSessionAdapter extends WorkoutSessionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/workouts";

  start(request: StartWorkoutRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl + "/start", request);
  }

  updateProgress(
    workoutId: string,
    request: WorkoutProgressRequest,
  ): Observable<void> {
    return this.http.put<void>(this.apiUrl + "/" + workoutId, request);
  }

  finish(workoutId: string, request: WorkoutProgressRequest): Observable<void> {
    return this.http.put<void>(
      this.apiUrl + "/" + workoutId + "/finish",
      request,
    );
  }

  discard(workoutId: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + "/" + workoutId);
  }

  getActive(): Observable<WorkoutDetail | null> {
    return this.http
      .get<WorkoutDetailResponse | null>(this.apiUrl + "/active")
      .pipe(map((response) => (response ? response.data : null)));
  }
}
