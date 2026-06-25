import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { LoginPort } from "../../domain/ports/login.port";
import { LoginRequest } from "../../domain/models/login-request.model";
import { LoginResponse } from "../../domain/models/login-response.model";

@Injectable()
export class HttpLoginAdapter extends LoginPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/login";

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials);
  }
}
