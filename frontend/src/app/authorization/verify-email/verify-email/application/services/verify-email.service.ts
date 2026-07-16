import { Observable } from "rxjs";
import { VerifyEmailPort } from "../../domain/ports/verify-email.port";

export class VerifyEmailService {
  constructor(private verifyEmailPort: VerifyEmailPort) {}

  verify(token: string): Observable<void> {
    return this.verifyEmailPort.verify(token);
  }
}
