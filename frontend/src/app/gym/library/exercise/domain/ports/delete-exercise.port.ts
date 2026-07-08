import { Observable } from "rxjs";

export abstract class DeleteExercisePort {
  abstract deleteExercise(id: string): Observable<void>;
}
