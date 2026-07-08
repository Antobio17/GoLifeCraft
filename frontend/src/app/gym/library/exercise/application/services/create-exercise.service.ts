import { Observable } from "rxjs";
import { CreateExercisePort } from "../../domain/ports/create-exercise.port";
import { CreateExerciseRequest } from "../../domain/models/create-exercise.model";

export class CreateExerciseService {
  constructor(private createExercisePort: CreateExercisePort) {}

  createExercise(request: CreateExerciseRequest): Observable<void> {
    return this.createExercisePort.createExercise(request);
  }
}
