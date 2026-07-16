import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ForgotPasswordPort } from "../../domain/ports/forgot-password.port";

@Injectable()
export class HttpForgotPasswordAdapter extends ForgotPasswordPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/authorization/password-reset-requests";

  requestReset(email: string): Observable<void> {
    return this.http.post<void>(this.apiUrl, { username: email });
  }
}
