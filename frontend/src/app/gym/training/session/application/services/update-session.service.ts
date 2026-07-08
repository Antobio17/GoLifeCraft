import { Observable } from "rxjs";
import { UpdateSessionPort } from "../../domain/ports/update-session.port";
import { UpdateSessionRequest } from "../../domain/models/session-request.model";

export class UpdateSessionService {
  constructor(private updateSessionPort: UpdateSessionPort) {}

  updateSession(id: string, request: UpdateSessionRequest): Observable<void> {
    return this.updateSessionPort.updateSession(id, request);
  }
}
