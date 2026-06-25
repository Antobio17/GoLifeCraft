import { Observable } from "rxjs";
import { LoginPort } from "../../domain/ports/login.port";
import { LoginRequest } from "../../domain/models/login-request.model";
import { LoginResponse } from "../../domain/models/login-response.model";

export class LoginService {
  constructor(private loginPort: LoginPort) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.loginPort.login(credentials);
  }
}
