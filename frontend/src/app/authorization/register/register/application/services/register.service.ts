import { Observable } from "rxjs";
import { RegisterPort } from "../../domain/ports/register.port";
import { RegisterRequest } from "../../domain/models/register-request.model";
import { RegisterResponse } from "../../domain/models/register-response.model";

export class RegisterService {
  constructor(private registerPort: RegisterPort) {}

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.registerPort.register(payload);
  }
}
