import { Observable } from "rxjs";
import { GetUsersResponse } from "../models/get-users-response.model";

export abstract class GetUsersPort {
  abstract getUsers(
    page?: number,
    pageSize?: number,
    filterUsername?: string,
    filterEmail?: string,
    filterRole?: string,
  ): Observable<GetUsersResponse>;
}
