import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RefreshTokenPort } from "../../domain/ports/refresh-token.port";
import { RefreshTokenResponse } from "../../domain/models/refresh-token-response.model";

@Injectable()
export class HttpRefreshTokenAdapter extends RefreshTokenPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/token/refresh";

  refresh(refreshToken: string): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(this.apiUrl, {
      refresh_token: refreshToken,
    });
  }
}
