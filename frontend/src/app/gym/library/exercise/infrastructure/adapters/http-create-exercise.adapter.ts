import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateExercisePort } from "../../domain/ports/create-exercise.port";
import { CreateExerciseRequest } from "../../domain/models/create-exercise.model";

@Injectable()
export class HttpCreateExerciseAdapter extends CreateExercisePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/exercise";

  createExercise(request: CreateExerciseRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
