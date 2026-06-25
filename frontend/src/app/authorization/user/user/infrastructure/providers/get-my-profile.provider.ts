import { Provider } from "@angular/core";
import { GetMyProfilePort } from "../../domain/ports/get-my-profile.port";
import { HttpGetMyProfileAdapter } from "../adapters/http-get-my-profile.adapter";
import { GetMyProfileService } from "../../application/services/get-my-profile.service";

export class GetMyProfileProvider {
  static getProviders(): Provider[] {
    return [
      { provide: GetMyProfilePort, useClass: HttpGetMyProfileAdapter },
      {
        provide: GetMyProfileService,
        useFactory: (port: GetMyProfilePort) => new GetMyProfileService(port),
        deps: [GetMyProfilePort],
      },
    ];
  }
}
