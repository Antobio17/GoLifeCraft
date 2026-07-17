import { Provider } from "@angular/core";
import { SetUserAccessPort } from "../../domain/ports/set-user-access.port";
import { HttpSetUserAccessAdapter } from "../adapters/http-set-user-access.adapter";
import { SetUserAccessService } from "../../application/services/set-user-access.service";

export class SetUserAccessProvider {
  static getProviders(): Provider[] {
    return [
      { provide: SetUserAccessPort, useClass: HttpSetUserAccessAdapter },
      {
        provide: SetUserAccessService,
        useFactory: (port: SetUserAccessPort) => new SetUserAccessService(port),
        deps: [SetUserAccessPort],
      },
    ];
  }
}
