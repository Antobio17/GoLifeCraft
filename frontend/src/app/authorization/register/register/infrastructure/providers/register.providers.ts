import { Provider } from "@angular/core";
import { RegisterPort } from "../../domain/ports/register.port";
import { HttpRegisterAdapter } from "../adapters/http-register.adapter";
import { RegisterService } from "../../application/services/register.service";

export class RegisterProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: RegisterPort,
        useClass: HttpRegisterAdapter,
      },
      {
        provide: RegisterService,
        useFactory: (registerPort: RegisterPort) =>
          new RegisterService(registerPort),
        deps: [RegisterPort],
      },
    ];
  }
}
