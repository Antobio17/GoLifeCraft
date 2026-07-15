import { Observable } from "rxjs";
import { GetDiaryResponse } from "../models/get-diary-response.model";

export abstract class GetDiaryPort {
  abstract getDiary(date?: string): Observable<GetDiaryResponse>;
}
