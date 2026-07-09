import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetWorkoutPort } from "../../domain/ports/get-workout.port";
import { WorkoutDetailResponse } from "../../domain/models/workout-detail.model";

@Injectable()
export class HttpGetWorkoutAdapter extends GetWorkoutPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/workouts";

  getWorkout(id: string): Observable<WorkoutDetailResponse> {
    return this.http.get<WorkoutDetailResponse>(this.apiUrl + "/" + id);
  }
}
