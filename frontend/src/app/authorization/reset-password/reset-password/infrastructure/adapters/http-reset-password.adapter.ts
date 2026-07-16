import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ResetPasswordPort } from "../../domain/ports/reset-password.port";

@Injectable()
export class HttpResetPasswordAdapter extends ResetPasswordPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/authorization/password-resets";

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(this.apiUrl, { token, newPassword });
  }
}
