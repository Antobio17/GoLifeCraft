import { Provider } from "@angular/core";
import { ImpersonateUserPort } from "../../domain/ports/impersonate-user.port";
import { HttpImpersonateUserAdapter } from "../adapters/http-impersonate-user.adapter";
import { ImpersonateUserService } from "../../application/services/impersonate-user.service";
import { ImpersonationService } from "@shared/auth/application/services/impersonation.service";

export class ImpersonateUserProvider {
  static getProviders(): Provider[] {
    return [
      { provide: ImpersonateUserPort, useClass: HttpImpersonateUserAdapter },
      {
        provide: ImpersonateUserService,
        useFactory: (
          port: ImpersonateUserPort,
          impersonationService: ImpersonationService,
        ) => new ImpersonateUserService(port, impersonationService),
        deps: [ImpersonateUserPort, ImpersonationService],
      },
    ];
  }
}
