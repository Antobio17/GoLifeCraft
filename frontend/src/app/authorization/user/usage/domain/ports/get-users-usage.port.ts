import { Observable } from "rxjs";
import { GetUsersUsageResponse } from "../models/get-users-usage-response.model";

export abstract class GetUsersUsagePort {
  abstract getUsersUsage(): Observable<GetUsersUsageResponse>;
}
