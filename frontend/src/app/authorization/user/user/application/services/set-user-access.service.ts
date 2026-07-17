import { Observable } from "rxjs";
import { SetUserAccessPort } from "../../domain/ports/set-user-access.port";
import { SetUserAccessRequest } from "../../domain/models/set-user-access-request.model";

export class SetUserAccessService {
  constructor(private port: SetUserAccessPort) {}

  setUserAccess(request: SetUserAccessRequest): Observable<void> {
    return this.port.setUserAccess(request);
  }
}
