import { Observable } from "rxjs";
import { UpdateUserRequest } from "../models/update-user-request.model";
import { GetUserResponse } from "../models/get-user-response.model";

export abstract class UpdateUserPort {
  abstract updateUser(
    userId: string,
    request: UpdateUserRequest,
  ): Observable<void>;
  abstract getUser(userId: string): Observable<GetUserResponse>;
}
