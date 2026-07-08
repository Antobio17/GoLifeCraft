import { Observable } from "rxjs";
import { UpdateSessionRequest } from "../models/session-request.model";

export abstract class UpdateSessionPort {
  abstract updateSession(
    id: string,
    request: UpdateSessionRequest,
  ): Observable<void>;
}
