import { Observable } from "rxjs";

export abstract class VerifyEmailPort {
  abstract verify(token: string): Observable<void>;
}
