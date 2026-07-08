import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateSessionPort } from "../../domain/ports/create-session.port";
import { CreateSessionRequest } from "../../domain/models/session-request.model";

@Injectable()
export class HttpCreateSessionAdapter extends CreateSessionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/session";

  createSession(request: CreateSessionRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
