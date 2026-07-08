import { Observable } from "rxjs";
import { DeleteExercisePort } from "../../domain/ports/delete-exercise.port";

export class DeleteExerciseService {
  constructor(private deleteExercisePort: DeleteExercisePort) {}

  deleteExercise(id: string): Observable<void> {
    return this.deleteExercisePort.deleteExercise(id);
  }
}
