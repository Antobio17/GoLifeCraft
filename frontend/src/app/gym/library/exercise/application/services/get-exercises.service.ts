import { Observable } from "rxjs";
import { GetExercisesPort } from "../../domain/ports/get-exercises.port";
import { GetExercisesResponse } from "../../domain/models/get-exercises-response.model";

export class GetExercisesService {
  constructor(private getExercisesPort: GetExercisesPort) {}

  getExercises(
    page: number = 1,
    pageSize: number = 10,
    filterName?: string,
    filterType?: string,
    filterMuscleGroup?: string,
  ): Observable<GetExercisesResponse> {
    return this.getExercisesPort.getExercises(
      page,
      pageSize,
      filterName,
      filterType,
      filterMuscleGroup,
    );
  }
}
