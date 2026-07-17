import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SetUserAccessPort } from "../../domain/ports/set-user-access.port";
import { SetUserAccessRequest } from "../../domain/models/set-user-access-request.model";

@Injectable()
export class HttpSetUserAccessAdapter implements SetUserAccessPort {
  private http = inject(HttpClient);

  setUserAccess(request: SetUserAccessRequest): Observable<void> {
    return this.http.put<void>(
      `/api/v1/authorization/users/${request.userId}/access`,
      { isActive: request.isActive },
    );
  }
}
