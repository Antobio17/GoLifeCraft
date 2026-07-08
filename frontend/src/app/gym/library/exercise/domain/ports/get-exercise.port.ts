import { Observable } from "rxjs";
import { GetExerciseResponse } from "../models/get-exercise-response.model";

export abstract class GetExercisePort {
  abstract getExercise(id: string): Observable<GetExerciseResponse>;
}
