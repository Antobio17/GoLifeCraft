import { Observable } from "rxjs";
import { GetUsersPort } from "../../domain/ports/get-users.port";
import { GetUsersResponse } from "../../domain/models/get-users-response.model";
export class GetUsersService {
  constructor(private getUsersPort: GetUsersPort) {}

  getUsers(
    page: number = 1,
    pageSize: number = 10,
    filterUsername?: string,
    filterEmail?: string,
    filterRole?: string,
  ): Observable<GetUsersResponse> {
    return this.getUsersPort.getUsers(
      page,
      pageSize,
      filterUsername,
      filterEmail,
      filterRole,
    );
  }
}
