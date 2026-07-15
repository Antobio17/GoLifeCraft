import { Observable } from "rxjs";
import { GetDiaryPort } from "../../domain/ports/get-diary.port";
import { GetDiaryResponse } from "../../domain/models/get-diary-response.model";

export class GetDiaryService {
  constructor(private getDiaryPort: GetDiaryPort) {}

  getDiary(date?: string): Observable<GetDiaryResponse> {
    return this.getDiaryPort.getDiary(date);
  }
}
