import { Observable } from "rxjs";
import { switchMap, tap, map } from "rxjs/operators";
import { LoginPort } from "../../domain/ports/login.port";
import { LoginRequest } from "../../domain/models/login-request.model";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { GetMyProfilePort } from "@authorization/user/user/domain/ports/get-my-profile.port";

export class PerformLoginUseCase {
  constructor(
    private loginPort: LoginPort,
    private authSessionService: AuthSessionService,
    private getMyProfilePort: GetMyProfilePort,
  ) {}

  execute(username: string, password: string): Observable<void> {
    const credentials: LoginRequest = { username, password };

    return this.loginPort.login(credentials).pipe(
      tap((response) => {
        this.authSessionService.saveSession({
          token: response.data.token,
          expiresAt: response.data.expires_at,
          tokenType: response.data.token_type,
          user: response.data.user,
          username,
        });
      }),
      switchMap(() =>
        this.getMyProfilePort.getMyProfile().pipe(
          tap((profile) => {
            const session = this.authSessionService.getSession();
            if (!session) return;
            this.authSessionService.saveSession({
              ...session,
              user: {
                ...session.user,
                role: profile.data.attributes.role,
                roles: [profile.data.attributes.role],
                canCreateFolder: profile.data.attributes.canCreateFolder,
                canDeleteFolder: profile.data.attributes.canDeleteFolder,
                canUploadFile: profile.data.attributes.canUploadFile,
                canDeleteFile: profile.data.attributes.canDeleteFile,
                canSignFile: profile.data.attributes.canSignFile,
                canRollbackSign: profile.data.attributes.canRollbackSign,
                canAccessUsers: profile.data.attributes.canAccessUsers,
              },
            });
          }),
          map(() => void 0),
        ),
      ),
    );
  }
}
