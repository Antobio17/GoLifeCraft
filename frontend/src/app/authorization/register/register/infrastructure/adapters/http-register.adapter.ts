import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RegisterPort } from "../../domain/ports/register.port";
import { RegisterRequest } from "../../domain/models/register-request.model";
import { RegisterResponse } from "../../domain/models/register-response.model";

@Injectable()
export class HttpRegisterAdapter extends RegisterPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/register";

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.apiUrl, payload);
  }
}
