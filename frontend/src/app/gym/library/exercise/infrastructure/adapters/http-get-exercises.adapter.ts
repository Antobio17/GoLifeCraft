import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetExercisesPort } from "../../domain/ports/get-exercises.port";
import { GetExercisesResponse } from "../../domain/models/get-exercises-response.model";

@Injectable()
export class HttpGetExercisesAdapter extends GetExercisesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/exercises";

  getExercises(
    page: number = 1,
    pageSize: number = 10,
    filterName?: string,
    filterType?: string,
    filterMuscleGroup?: string,
  ): Observable<GetExercisesResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterName) {
      params = params.set("filter[name]", filterName);
    }

    if (filterType) {
      params = params.set("filter[type]", filterType);
    }

    if (filterMuscleGroup) {
      params = params.set("filter[muscleGroup]", filterMuscleGroup);
    }

    return this.http.get<GetExercisesResponse>(this.apiUrl, { params });
  }
}
