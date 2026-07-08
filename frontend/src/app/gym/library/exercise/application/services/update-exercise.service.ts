import { Observable } from "rxjs";
import { UpdateExercisePort } from "../../domain/ports/update-exercise.port";
import { UpdateExerciseRequest } from "../../domain/models/update-exercise.model";

export class UpdateExerciseService {
  constructor(private updateExercisePort: UpdateExercisePort) {}

  updateExercise(id: string, request: UpdateExerciseRequest): Observable<void> {
    return this.updateExercisePort.updateExercise(id, request);
  }
}
