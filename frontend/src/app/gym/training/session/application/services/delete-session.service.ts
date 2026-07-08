import { Observable } from "rxjs";
import { DeleteSessionPort } from "../../domain/ports/delete-session.port";

export class DeleteSessionService {
  constructor(private deleteSessionPort: DeleteSessionPort) {}

  deleteSession(id: string): Observable<void> {
    return this.deleteSessionPort.deleteSession(id);
  }
}
