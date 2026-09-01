import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetUserUsagePort } from "../../domain/ports/get-user-usage.port";
import { GetUserUsageResponse } from "../../domain/models/get-user-usage-response.model";

@Injectable()
export class HttpGetUserUsageAdapter implements GetUserUsagePort {
  private http = inject(HttpClient);

  getUserUsage(userId: string): Observable<GetUserUsageResponse> {
    return this.http.get<GetUserUsageResponse>(
      `/api/v1/authorization/users/${userId}/usage`,
    );
  }
}
