import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ImpersonateUserPort } from "../../domain/ports/impersonate-user.port";
import { ImpersonateUserResponse } from "../../domain/models/impersonate-user-response.model";

@Injectable()
export class HttpImpersonateUserAdapter implements ImpersonateUserPort {
  private http = inject(HttpClient);

  impersonate(userId: string): Observable<ImpersonateUserResponse> {
    return this.http.post<ImpersonateUserResponse>(
      `/api/v1/authorization/users/${userId}/impersonation`,
      {},
    );
  }
}
