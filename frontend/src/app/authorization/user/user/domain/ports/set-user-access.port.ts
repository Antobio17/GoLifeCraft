import { Observable } from "rxjs";
import { SetUserAccessRequest } from "../models/set-user-access-request.model";

export abstract class SetUserAccessPort {
  abstract setUserAccess(request: SetUserAccessRequest): Observable<void>;
}
