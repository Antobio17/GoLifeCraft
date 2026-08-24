import { Observable } from "rxjs";
import { GetUserResponse } from "../models/get-user-response.model";

export abstract class GetUserPort {
  abstract getUser(userId: string): Observable<GetUserResponse>;
}
