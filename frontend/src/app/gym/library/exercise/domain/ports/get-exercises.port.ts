import { Observable } from "rxjs";
import { GetExercisesResponse } from "../models/get-exercises-response.model";

export abstract class GetExercisesPort {
  abstract getExercises(
    page?: number,
    pageSize?: number,
    filterName?: string,
    filterType?: string,
    filterMuscleGroup?: string,
  ): Observable<GetExercisesResponse>;
}
