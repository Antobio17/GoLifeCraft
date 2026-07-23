import { Observable } from "rxjs";
import { ExerciseStats } from "../models/exercise-stats.model";

export abstract class GetExerciseStatsPort {
  abstract getExerciseStats(id: string): Observable<ExerciseStats>;
}
