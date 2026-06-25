import { Provider } from "@angular/core";
import { LoginPort } from "../../domain/ports/login.port";
import { HttpLoginAdapter } from "../adapters/http-login.adapter";
import { LoginService } from "../../application/services/login.service";
import { PerformLoginUseCase } from "../../application/use-cases/perform-login.use-case";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { GetMyProfilePort } from "@authorization/user/user/domain/ports/get-my-profile.port";
import { HttpGetMyProfileAdapter } from "@authorization/user/user/infrastructure/adapters/http-get-my-profile.adapter";

export class LoginProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: LoginPort,
        useClass: HttpLoginAdapter,
      },
      {
        provide: LoginService,
        useFactory: (loginPort: LoginPort) => new LoginService(loginPort),
        deps: [LoginPort],
      },
      {
        provide: GetMyProfilePort,
        useClass: HttpGetMyProfileAdapter,
      },
      {
        provide: PerformLoginUseCase,
        useFactory: (
          loginPort: LoginPort,
          authSessionService: AuthSessionService,
          getMyProfilePort: GetMyProfilePort,
        ) =>
          new PerformLoginUseCase(
            loginPort,
            authSessionService,
            getMyProfilePort,
          ),
        deps: [LoginPort, AuthSessionService, GetMyProfilePort],
      },
    ];
  }
}
