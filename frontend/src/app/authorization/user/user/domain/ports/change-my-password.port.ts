import { Observable } from "rxjs";
import { ChangeMyPasswordRequest } from "../models/change-my-password-request.model";

export abstract class ChangeMyPasswordPort {
  abstract changeMyPassword(request: ChangeMyPasswordRequest): Observable<void>;
}
