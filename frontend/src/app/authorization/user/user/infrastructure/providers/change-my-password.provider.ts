import { Provider } from "@angular/core";
import { ChangeMyPasswordPort } from "../../domain/ports/change-my-password.port";
import { HttpChangeMyPasswordAdapter } from "../adapters/http-change-my-password.adapter";
import { ChangeMyPasswordService } from "../../application/services/change-my-password.service";

export class ChangeMyPasswordProvider {
  static getProviders(): Provider[] {
    return [
      { provide: ChangeMyPasswordPort, useClass: HttpChangeMyPasswordAdapter },
      {
        provide: ChangeMyPasswordService,
        useFactory: (port: ChangeMyPasswordPort) =>
          new ChangeMyPasswordService(port),
        deps: [ChangeMyPasswordPort],
      },
    ];
  }
}
