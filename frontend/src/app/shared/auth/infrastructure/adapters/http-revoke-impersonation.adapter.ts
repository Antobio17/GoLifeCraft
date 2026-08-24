import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RevokeImpersonationPort } from "../../domain/ports/revoke-impersonation.port";

@Injectable()
export class HttpRevokeImpersonationAdapter implements RevokeImpersonationPort {
  private http = inject(HttpClient);

  revoke(): Observable<void> {
    return this.http.delete<void>("/api/v1/authorization/impersonation");
  }
}
