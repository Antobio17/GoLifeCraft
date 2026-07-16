import { Observable } from "rxjs";

export abstract class ForgotPasswordPort {
  abstract requestReset(email: string): Observable<void>;
}
