import { Observable } from "rxjs";
import { LoginRequest } from "../models/login-request.model";
import { LoginResponse } from "../models/login-response.model";

export abstract class LoginPort {
  abstract login(credentials: LoginRequest): Observable<LoginResponse>;
}
