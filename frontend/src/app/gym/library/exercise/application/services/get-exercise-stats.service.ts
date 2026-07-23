import { Observable } from "rxjs";
import { GetExerciseStatsPort } from "../../domain/ports/get-exercise-stats.port";
import { ExerciseStats } from "../../domain/models/exercise-stats.model";

export class GetExerciseStatsService {
  constructor(private getExerciseStatsPort: GetExerciseStatsPort) {}

  getExerciseStats(id: string): Observable<ExerciseStats> {
    return this.getExerciseStatsPort.getExerciseStats(id);
  }
}
