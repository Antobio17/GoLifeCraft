import { Provider } from "@angular/core";
import { AuthSessionPort } from "../../domain/ports/auth-session.port";
import { ImpersonationSessionPort } from "../../domain/ports/impersonation-session.port";
import { LocalStorageAuthSessionAdapter } from "../adapters/local-storage-auth-session.adapter";
import { LocalStorageImpersonationSessionAdapter } from "../adapters/local-storage-impersonation-session.adapter";
import { RevokeImpersonationPort } from "../../domain/ports/revoke-impersonation.port";
import { HttpRevokeImpersonationAdapter } from "../adapters/http-revoke-impersonation.adapter";
import { AuthSessionService } from "../../application/services/auth-session.service";

export class AuthSessionProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: AuthSessionPort,
        useClass: LocalStorageAuthSessionAdapter,
      },
      {
        provide: ImpersonationSessionPort,
        useClass: LocalStorageImpersonationSessionAdapter,
      },
      {
        provide: RevokeImpersonationPort,
        useClass: HttpRevokeImpersonationAdapter,
      },
      {
        provide: AuthSessionService,
        useFactory: (
          port: AuthSessionPort,
          impersonationSessionPort: ImpersonationSessionPort,
        ) => new AuthSessionService(port, impersonationSessionPort),
        deps: [AuthSessionPort, ImpersonationSessionPort],
      },
    ];
  }
}
