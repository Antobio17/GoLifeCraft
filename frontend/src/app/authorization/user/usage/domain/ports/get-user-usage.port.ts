import { Observable } from "rxjs";
import { GetUserUsageResponse } from "../models/get-user-usage-response.model";

export abstract class GetUserUsagePort {
  abstract getUserUsage(userId: string): Observable<GetUserUsageResponse>;
}
