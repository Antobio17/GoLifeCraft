import { Observable } from "rxjs";
import { CreateExerciseRequest } from "../models/create-exercise.model";

export abstract class CreateExercisePort {
  abstract createExercise(request: CreateExerciseRequest): Observable<void>;
}
