import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { GetExerciseTopSetsPort } from "../../domain/ports/get-exercise-top-sets.port";
import { ExerciseTopSet } from "../../domain/models/exercise-top-set.model";

interface ExerciseTopSetsSingleResponse {
  data: {
    id: string;
    type: string;
    attributes: { topSets: ExerciseTopSet[] };
  } | null;
}

@Injectable()
export class HttpGetExerciseTopSetsAdapter extends GetExerciseTopSetsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/exercises/top-sets";

  getExerciseTopSets(exerciseIds: string[]): Observable<ExerciseTopSet[]> {
    const params = new HttpParams().set(
      "filter[exerciseIds]",
      exerciseIds.join(","),
    );

    return this.http
      .get<ExerciseTopSetsSingleResponse>(this.apiUrl, { params })
      .pipe(map((response) => response.data?.attributes.topSets ?? []));
  }
}
