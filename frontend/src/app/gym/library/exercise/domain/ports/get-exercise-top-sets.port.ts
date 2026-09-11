import { Observable } from "rxjs";
import { ExerciseTopSet } from "../models/exercise-top-set.model";

export abstract class GetExerciseTopSetsPort {
  abstract getExerciseTopSets(
    exerciseIds: string[],
  ): Observable<ExerciseTopSet[]>;
}
