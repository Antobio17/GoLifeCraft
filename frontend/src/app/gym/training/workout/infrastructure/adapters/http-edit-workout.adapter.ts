import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { EditWorkoutPort } from "../../domain/ports/edit-workout.port";
import { EditWorkoutRequest } from "../../domain/models/edit-workout-request.model";

@Injectable()
export class HttpEditWorkoutAdapter extends EditWorkoutPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/workouts";

  editWorkout(
    workoutId: string,
    request: EditWorkoutRequest,
  ): Observable<void> {
    return this.http.put<void>(
      this.apiUrl + "/" + workoutId + "/edit",
      request,
    );
  }
}
