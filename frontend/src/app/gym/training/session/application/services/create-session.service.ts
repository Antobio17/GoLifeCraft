import { Observable } from "rxjs";
import { CreateSessionPort } from "../../domain/ports/create-session.port";
import { CreateSessionRequest } from "../../domain/models/session-request.model";

export class CreateSessionService {
  constructor(private createSessionPort: CreateSessionPort) {}

  createSession(request: CreateSessionRequest): Observable<void> {
    return this.createSessionPort.createSession(request);
  }
}
