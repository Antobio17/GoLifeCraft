import { Provider } from "@angular/core";
import { UpdateMyProfilePort } from "../../domain/ports/update-my-profile.port";
import { HttpUpdateMyProfileAdapter } from "../adapters/http-update-my-profile.adapter";
import { UpdateMyProfileService } from "../../application/services/update-my-profile.service";

export class UpdateMyProfileProvider {
  static getProviders(): Provider[] {
    return [
      { provide: UpdateMyProfilePort, useClass: HttpUpdateMyProfileAdapter },
      {
        provide: UpdateMyProfileService,
        useFactory: (port: UpdateMyProfilePort) =>
          new UpdateMyProfileService(port),
        deps: [UpdateMyProfilePort],
      },
    ];
  }
}
