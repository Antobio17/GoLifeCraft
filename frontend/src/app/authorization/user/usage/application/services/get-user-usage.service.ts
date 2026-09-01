import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GetUserUsagePort } from "../../domain/ports/get-user-usage.port";
import { UserUsage } from "../../domain/models/user-usage.model";

export class GetUserUsageService {
  constructor(private port: GetUserUsagePort) {}

  getUserUsage(userId: string): Observable<UserUsage> {
    return this.port.getUserUsage(userId).pipe(
      map((response) => ({
        id: response.data.id,
        ...response.data.attributes,
      })),
    );
  }
}
