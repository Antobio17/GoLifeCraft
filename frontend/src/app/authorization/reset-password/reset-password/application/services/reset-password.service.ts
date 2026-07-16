import { Observable } from "rxjs";
import { ResetPasswordPort } from "../../domain/ports/reset-password.port";

export class ResetPasswordService {
  constructor(private resetPasswordPort: ResetPasswordPort) {}

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.resetPasswordPort.resetPassword(token, newPassword);
  }
}
