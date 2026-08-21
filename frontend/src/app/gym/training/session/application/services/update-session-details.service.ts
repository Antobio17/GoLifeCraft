import { Observable } from "rxjs";
import { UpdateSessionDetailsPort } from "../../domain/ports/update-session-details.port";
import { UpdateSessionDetailsRequest } from "../../domain/models/update-session-details-request.model";

export class UpdateSessionDetailsService {
  constructor(private updateSessionDetailsPort: UpdateSessionDetailsPort) {}

  updateSessionDetails(
    sessionId: string,
    request: UpdateSessionDetailsRequest,
  ): Observable<void> {
    return this.updateSessionDetailsPort.updateSessionDetails(
      sessionId,
      request,
    );
  }
}
