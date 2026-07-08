import { Observable } from "rxjs";
import { GetSessionPort } from "../../domain/ports/get-session.port";
import { GetSessionResponse } from "../../domain/models/get-session-response.model";

export class GetSessionService {
  constructor(private getSessionPort: GetSessionPort) {}

  getSession(id: string): Observable<GetSessionResponse> {
    return this.getSessionPort.getSession(id);
  }
}
