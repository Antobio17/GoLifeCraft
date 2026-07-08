import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteExercisePort } from "../../domain/ports/delete-exercise.port";

@Injectable()
export class HttpDeleteExerciseAdapter extends DeleteExercisePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/exercise";

  deleteExercise(id: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + "/" + id);
  }
}
