import { Provider } from "@angular/core";
import { AuthSessionPort } from "../../domain/ports/auth-session.port";
import { LocalStorageAuthSessionAdapter } from "../adapters/local-storage-auth-session.adapter";
import { AuthSessionService } from "../../application/services/auth-session.service";

export class AuthSessionProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: AuthSessionPort,
        useClass: LocalStorageAuthSessionAdapter,
      },
      {
        provide: AuthSessionService,
        useFactory: (port: AuthSessionPort) => new AuthSessionService(port),
        deps: [AuthSessionPort],
      },
    ];
  }
}
