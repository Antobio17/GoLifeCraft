import { Provider } from "@angular/core";
import { GetUsersPort } from "../../domain/ports/get-users.port";
import { HttpGetUsersAdapter } from "../adapters/http-get-users.adapter";
import { GetUsersService } from "../../application/services/get-users.service";

export class GetUsersProvider {
  static getProviders(): Provider[] {
    return [
      { provide: GetUsersPort, useClass: HttpGetUsersAdapter },
      {
        provide: GetUsersService,
        useFactory: (port: GetUsersPort) => new GetUsersService(port),
        deps: [GetUsersPort],
      },
    ];
  }
}
