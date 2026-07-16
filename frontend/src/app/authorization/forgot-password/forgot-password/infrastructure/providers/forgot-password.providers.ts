import { Provider } from "@angular/core";
import { ForgotPasswordPort } from "../../domain/ports/forgot-password.port";
import { HttpForgotPasswordAdapter } from "../adapters/http-forgot-password.adapter";
import { ForgotPasswordService } from "../../application/services/forgot-password.service";

export class ForgotPasswordProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: ForgotPasswordPort,
        useClass: HttpForgotPasswordAdapter,
      },
      {
        provide: ForgotPasswordService,
        useFactory: (port: ForgotPasswordPort) =>
          new ForgotPasswordService(port),
        deps: [ForgotPasswordPort],
      },
    ];
  }
}
