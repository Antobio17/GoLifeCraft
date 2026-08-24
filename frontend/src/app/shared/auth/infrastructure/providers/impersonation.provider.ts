import { Provider } from "@angular/core";
import { ImpersonationSessionPort } from "../../domain/ports/impersonation-session.port";
import { RevokeImpersonationPort } from "../../domain/ports/revoke-impersonation.port";
import { ImpersonationService } from "../../application/services/impersonation.service";
import { AuthSessionService } from "../../application/services/auth-session.service";

export class ImpersonationProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: ImpersonationService,
        useFactory: (
          port: ImpersonationSessionPort,
          revokeImpersonationPort: RevokeImpersonationPort,
          authSessionService: AuthSessionService,
        ) =>
          new ImpersonationService(
            port,
            revokeImpersonationPort,
            authSessionService,
          ),
        deps: [
          ImpersonationSessionPort,
          RevokeImpersonationPort,
          AuthSessionService,
        ],
      },
    ];
  }
}
