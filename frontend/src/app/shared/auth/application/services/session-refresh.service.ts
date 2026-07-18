import { inject } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map } from "rxjs/operators";
import { AuthSession } from "../../domain/models/auth-session.model";
import { RefreshTokenPort } from "../../domain/ports/refresh-token.port";
import { AuthSessionService } from "./auth-session.service";

export class SessionRefreshService {
  private refreshTokenPort = inject(RefreshTokenPort);
  private authSessionService = inject(AuthSessionService);

  refresh(): Observable<AuthSession> {
    const session = this.authSessionService.getSession();

    if (!session?.refreshToken) {
      return throwError(() => new Error("missing-refresh-token"));
    }

    return this.refreshTokenPort.refresh(session.refreshToken).pipe(
      map((response) => {
        const refreshedSession: AuthSession = {
          ...session,
          token: response.data.token,
          expiresAt: response.data.expires_at,
          tokenType: response.data.token_type,
          refreshToken: response.data.refresh_token,
        };

        this.authSessionService.saveSession(refreshedSession);

        return refreshedSession;
      }),
    );
  }
}
