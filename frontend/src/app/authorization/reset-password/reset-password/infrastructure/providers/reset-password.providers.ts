import { Provider } from "@angular/core";
import { ResetPasswordPort } from "../../domain/ports/reset-password.port";
import { HttpResetPasswordAdapter } from "../adapters/http-reset-password.adapter";
import { ResetPasswordService } from "../../application/services/reset-password.service";

export class ResetPasswordProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: ResetPasswordPort,
        useClass: HttpResetPasswordAdapter,
      },
      {
        provide: ResetPasswordService,
        useFactory: (port: ResetPasswordPort) => new ResetPasswordService(port),
        deps: [ResetPasswordPort],
      },
    ];
  }
}
