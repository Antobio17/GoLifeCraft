import { Provider } from "@angular/core";
import { GetUsersPort } from "@authorization/user/user/domain/ports/get-users.port";
import { HttpGetUsersAdapter } from "@authorization/user/user/infrastructure/adapters/http-get-users.adapter";
import { GetUsersService } from "@authorization/user/user/application/services/get-users.service";

export class GetUsersProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetUsersPort,
        useClass: HttpGetUsersAdapter,
      },
      {
        provide: GetUsersService,
        useFactory: (getUsersPort: GetUsersPort) =>
          new GetUsersService(getUsersPort),
        deps: [GetUsersPort],
      },
    ];
  }
}
