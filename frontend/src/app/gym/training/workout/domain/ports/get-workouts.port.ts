import { Observable } from "rxjs";
import { GetWorkoutsResponse } from "../models/get-workouts-response.model";

export abstract class GetWorkoutsPort {
  abstract getWorkouts(
    page: number,
    pageSize: number,
  ): Observable<GetWorkoutsResponse>;
}
