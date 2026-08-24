import { Observable } from "rxjs";
import { ImpersonateUserResponse } from "../models/impersonate-user-response.model";

export abstract class ImpersonateUserPort {
  abstract impersonate(userId: string): Observable<ImpersonateUserResponse>;
}
