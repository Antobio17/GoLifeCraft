import { Observable } from "rxjs";
import { RegisterRequest } from "../models/register-request.model";
import { RegisterResponse } from "../models/register-response.model";

export abstract class RegisterPort {
  abstract register(payload: RegisterRequest): Observable<RegisterResponse>;
}
