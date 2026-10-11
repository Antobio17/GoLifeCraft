import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GetUsersUsagePort } from "../../domain/ports/get-users-usage.port";
import { UserUsageSummary } from "../../domain/models/user-usage-summary.model";

@Injectable()
export class GetUsersUsageService {
  private port = inject(GetUsersUsagePort);

  getUsersUsage(): Observable<UserUsageSummary[]> {
    return this.port
      .getUsersUsage()
      .pipe(
        map((response) =>
          response.data.map((item) => ({ id: item.id, ...item.attributes })),
        ),
      );
  }
}
