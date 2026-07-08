import { Observable } from "rxjs";
import { GetExercisePort } from "../../domain/ports/get-exercise.port";
import { GetExerciseResponse } from "../../domain/models/get-exercise-response.model";

export class GetExerciseService {
  constructor(private getExercisePort: GetExercisePort) {}

  getExercise(id: string): Observable<GetExerciseResponse> {
    return this.getExercisePort.getExercise(id);
  }
}
