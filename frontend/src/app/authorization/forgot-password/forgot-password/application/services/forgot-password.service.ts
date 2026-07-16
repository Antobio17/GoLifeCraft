import { Observable } from "rxjs";
import { ForgotPasswordPort } from "../../domain/ports/forgot-password.port";

export class ForgotPasswordService {
  constructor(private forgotPasswordPort: ForgotPasswordPort) {}

  requestReset(email: string): Observable<void> {
    return this.forgotPasswordPort.requestReset(email);
  }
}
