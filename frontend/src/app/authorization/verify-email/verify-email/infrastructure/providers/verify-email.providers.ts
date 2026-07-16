import { Provider } from "@angular/core";
import { VerifyEmailPort } from "../../domain/ports/verify-email.port";
import { HttpVerifyEmailAdapter } from "../adapters/http-verify-email.adapter";
import { VerifyEmailService } from "../../application/services/verify-email.service";

export class VerifyEmailProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: VerifyEmailPort,
        useClass: HttpVerifyEmailAdapter,
      },
      {
        provide: VerifyEmailService,
        useFactory: (port: VerifyEmailPort) => new VerifyEmailService(port),
        deps: [VerifyEmailPort],
      },
    ];
  }
}
