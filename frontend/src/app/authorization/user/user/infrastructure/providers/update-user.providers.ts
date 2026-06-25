import { Provider } from "@angular/core";
import { UpdateUserPort } from "@authorization/user/user/domain/ports/update-user.port";
import { HttpUpdateUserAdapter } from "@authorization/user/user/infrastructure/adapters/http-update-user.adapter";
import { UpdateUserService } from "@authorization/user/user/application/services/update-user.service";

export class UpdateUserProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: UpdateUserPort,
        useClass: HttpUpdateUserAdapter,
      },
      {
        provide: UpdateUserService,
        useFactory: (updateUserPort: UpdateUserPort) =>
          new UpdateUserService(updateUserPort),
        deps: [UpdateUserPort],
      },
    ];
  }
}
