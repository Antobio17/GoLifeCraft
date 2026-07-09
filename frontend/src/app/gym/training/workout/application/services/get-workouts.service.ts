import { Observable } from "rxjs";
import { GetWorkoutsPort } from "../../domain/ports/get-workouts.port";
import { GetWorkoutsResponse } from "../../domain/models/get-workouts-response.model";

export class GetWorkoutsService {
  constructor(private getWorkoutsPort: GetWorkoutsPort) {}

  getWorkouts(
    page: number = 1,
    pageSize: number = 20,
  ): Observable<GetWorkoutsResponse> {
    return this.getWorkoutsPort.getWorkouts(page, pageSize);
  }
}
