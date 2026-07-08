import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateExercisePort } from "../../domain/ports/update-exercise.port";
import { UpdateExerciseRequest } from "../../domain/models/update-exercise.model";

@Injectable()
export class HttpUpdateExerciseAdapter extends UpdateExercisePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/exercise";

  updateExercise(id: string, request: UpdateExerciseRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl + "/" + id, request);
  }
}
