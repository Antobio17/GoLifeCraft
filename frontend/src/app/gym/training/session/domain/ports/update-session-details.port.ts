import { Observable } from "rxjs";
import { UpdateSessionDetailsRequest } from "../models/update-session-details-request.model";

export abstract class UpdateSessionDetailsPort {
  abstract updateSessionDetails(
    sessionId: string,
    request: UpdateSessionDetailsRequest,
  ): Observable<void>;
}
