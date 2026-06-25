import { Provider } from "@angular/core";
import { DeleteUserPort } from "@authorization/user/user/domain/ports/delete-user.port";
import { HttpDeleteUserAdapter } from "@authorization/user/user/infrastructure/adapters/http-delete-user.adapter";
import { DeleteUserService } from "@authorization/user/user/application/services/delete-user.service";

export class DeleteUserProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: DeleteUserPort,
        useClass: HttpDeleteUserAdapter,
      },
      {
        provide: DeleteUserService,
        useFactory: (deleteUserPort: DeleteUserPort) =>
          new DeleteUserService(deleteUserPort),
        deps: [DeleteUserPort],
      },
    ];
  }
}
