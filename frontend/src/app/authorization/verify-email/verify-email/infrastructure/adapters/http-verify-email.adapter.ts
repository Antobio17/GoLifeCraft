import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { VerifyEmailPort } from "../../domain/ports/verify-email.port";

@Injectable()
export class HttpVerifyEmailAdapter extends VerifyEmailPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/verify-email";

  verify(token: string): Observable<void> {
    return this.http.post<void>(this.apiUrl, { token });
  }
}
