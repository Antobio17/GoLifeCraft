import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetUsersUsagePort } from "../../domain/ports/get-users-usage.port";
import { GetUsersUsageResponse } from "../../domain/models/get-users-usage-response.model";

@Injectable()
export class HttpGetUsersUsageAdapter implements GetUsersUsagePort {
  private http = inject(HttpClient);

  getUsersUsage(): Observable<GetUsersUsageResponse> {
    return this.http.get<GetUsersUsageResponse>("/api/v1/authorization/usage");
  }
}
