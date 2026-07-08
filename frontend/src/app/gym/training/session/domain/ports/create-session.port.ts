import { Observable } from "rxjs";
import { CreateSessionRequest } from "../models/session-request.model";

export abstract class CreateSessionPort {
  abstract createSession(request: CreateSessionRequest): Observable<void>;
}
