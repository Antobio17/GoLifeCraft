import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetExercisePort } from "../../domain/ports/get-exercise.port";
import { GetExerciseResponse } from "../../domain/models/get-exercise-response.model";

@Injectable()
export class HttpGetExerciseAdapter extends GetExercisePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/exercise";

  getExercise(id: string): Observable<GetExerciseResponse> {
    return this.http.get<GetExerciseResponse>(this.apiUrl + "/" + id);
  }
}
