import { Observable } from "rxjs";
import { GetSessionResponse } from "../models/get-session-response.model";

export abstract class GetSessionPort {
  abstract getSession(id: string): Observable<GetSessionResponse>;
}
