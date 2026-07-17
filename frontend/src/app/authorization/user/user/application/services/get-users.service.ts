import { Observable } from "rxjs";
import { GetUsersPort } from "../../domain/ports/get-users.port";
import { GetUsersResponse } from "../../domain/models/get-users-response.model";

export class GetUsersService {
  constructor(private port: GetUsersPort) {}

  getUsers(page = 1, pageSize = 100): Observable<GetUsersResponse> {
    return this.port.getUsers(page, pageSize);
  }
}
