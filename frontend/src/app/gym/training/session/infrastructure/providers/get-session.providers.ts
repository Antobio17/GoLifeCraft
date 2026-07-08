import { Provider } from "@angular/core";
import { GetSessionPort } from "@gym/training/session/domain/ports/get-session.port";
import { HttpGetSessionAdapter } from "@gym/training/session/infrastructure/adapters/http-get-session.adapter";
import { GetSessionService } from "@gym/training/session/application/services/get-session.service";

export class GetSessionProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetSessionPort, useClass: HttpGetSessionAdapter },
      {
        provide: GetSessionService,
        useFactory: (port: GetSessionPort) => new GetSessionService(port),
        deps: [GetSessionPort],
      },
    ];
  }
}
