import { Observable, of } from "rxjs";
import { GetExerciseTopSetsPort } from "../../domain/ports/get-exercise-top-sets.port";
import { ExerciseTopSet } from "../../domain/models/exercise-top-set.model";

export class GetExerciseTopSetsService {
  constructor(private getExerciseTopSetsPort: GetExerciseTopSetsPort) {}

  getExerciseTopSets(exerciseIds: string[]): Observable<ExerciseTopSet[]> {
    const wanted = [...new Set(exerciseIds)];

    if (wanted.length === 0) {
      return of([]);
    }

    return this.getExerciseTopSetsPort.getExerciseTopSets(wanted);
  }
}
