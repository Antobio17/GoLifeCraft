import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { GetExerciseStatsPort } from "../../domain/ports/get-exercise-stats.port";
import { ExerciseStats } from "../../domain/models/exercise-stats.model";

interface ExerciseStatsSingleResponse {
  data: {
    id: string;
    type: string;
    attributes: ExerciseStats;
  } | null;
}

@Injectable()
export class HttpGetExerciseStatsAdapter extends GetExerciseStatsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/exercise";

  getExerciseStats(id: string): Observable<ExerciseStats> {
    return this.http
      .get<ExerciseStatsSingleResponse>(this.apiUrl + "/" + id + "/stats")
      .pipe(
        map(
          (response) =>
            response.data?.attributes ?? { exerciseId: id, sessions: [] },
        ),
      );
  }
}
