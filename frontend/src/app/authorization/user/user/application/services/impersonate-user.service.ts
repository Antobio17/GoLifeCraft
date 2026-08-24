import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { ImpersonateUserPort } from "../../domain/ports/impersonate-user.port";
import { ImpersonateUserResponse } from "../../domain/models/impersonate-user-response.model";
import { ImpersonationService } from "@shared/auth/application/services/impersonation.service";

export class ImpersonateUserService {
  constructor(
    private port: ImpersonateUserPort,
    private impersonationService: ImpersonationService,
  ) {}

  impersonate(userId: string): Observable<ImpersonateUserResponse> {
    return this.port
      .impersonate(userId)
      .pipe(tap((response) => this.startImpersonation(response)));
  }

  private startImpersonation(response: ImpersonateUserResponse): void {
    const { token, expires_at, token_type, user } = response.data;
    const displayName = `${user.name ?? ""} ${user.lastname ?? ""}`.trim();

    this.impersonationService.start(
      {
        userId: user.id,
        email: user.email,
        name: displayName || user.email,
        tenantId: user.tenantId,
        expiresAt: expires_at,
      },
      {
        token,
        expiresAt: expires_at,
        tokenType: token_type,
        user: {
          username: user.email,
          email: user.email,
          name: user.name,
          lastname: user.lastname,
          roles: user.roles,
          role: user.role,
        },
        email: user.email,
      },
    );
  }
}
