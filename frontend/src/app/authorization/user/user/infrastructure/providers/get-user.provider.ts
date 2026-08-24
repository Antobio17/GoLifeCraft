import { Provider } from "@angular/core";
import { GetUserPort } from "../../domain/ports/get-user.port";
import { HttpGetUserAdapter } from "../adapters/http-get-user.adapter";
import { GetUserService } from "../../application/services/get-user.service";

export class GetUserProvider {
  static getProviders(): Provider[] {
    return [
      { provide: GetUserPort, useClass: HttpGetUserAdapter },
      {
        provide: GetUserService,
        useFactory: (port: GetUserPort) => new GetUserService(port),
        deps: [GetUserPort],
      },
    ];
  }
}
