import { Observable } from "rxjs";

export abstract class RevokeImpersonationPort {
  abstract revoke(): Observable<void>;
}
