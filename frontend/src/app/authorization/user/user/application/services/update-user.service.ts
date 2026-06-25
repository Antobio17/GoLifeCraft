import { Observable } from "rxjs";
import { UpdateUserPort } from "../../domain/ports/update-user.port";
import { UpdateUserRequest } from "../../domain/models/update-user-request.model";
import { GetUserResponse } from "../../domain/models/get-user-response.model";

export class UpdateUserService {
  constructor(private updateUserPort: UpdateUserPort) {}

  updateUser(userId: string, request: UpdateUserRequest): Observable<void> {
    return this.updateUserPort.updateUser(userId, request);
  }

  getUser(userId: string): Observable<GetUserResponse> {
    return this.updateUserPort.getUser(userId);
  }
}
