import { Observable } from "rxjs";

export abstract class ResetPasswordPort {
  abstract resetPassword(token: string, newPassword: string): Observable<void>;
}
