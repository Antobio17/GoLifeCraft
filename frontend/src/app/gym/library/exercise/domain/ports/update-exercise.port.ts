import { Observable } from "rxjs";
import { UpdateExerciseRequest } from "../models/update-exercise.model";

export abstract class UpdateExercisePort {
  abstract updateExercise(
    id: string,
    request: UpdateExerciseRequest,
  ): Observable<void>;
}
