import { Provider } from "@angular/core";
import { CreateUserPort } from "@authorization/user/user/domain/ports/create-user.port";
import { HttpCreateUserAdapter } from "@authorization/user/user/infrastructure/adapters/http-create-user.adapter";
import { CreateUserService } from "@authorization/user/user/application/services/create-user.service";

export class CreateUserProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: CreateUserPort,
        useClass: HttpCreateUserAdapter,
      },
      {
        provide: CreateUserService,
        useFactory: (createUserPort: CreateUserPort) =>
          new CreateUserService(createUserPort),
        deps: [CreateUserPort],
      },
    ];
  }
}
