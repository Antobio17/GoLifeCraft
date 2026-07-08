import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetSessionPort } from "../../domain/ports/get-session.port";
import { GetSessionResponse } from "../../domain/models/get-session-response.model";

@Injectable()
export class HttpGetSessionAdapter extends GetSessionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/session";

  getSession(id: string): Observable<GetSessionResponse> {
    return this.http.get<GetSessionResponse>(this.apiUrl + "/" + id);
  }
}
