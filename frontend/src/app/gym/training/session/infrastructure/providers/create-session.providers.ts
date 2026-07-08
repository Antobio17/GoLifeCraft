import { Provider } from "@angular/core";
import { CreateSessionPort } from "@gym/training/session/domain/ports/create-session.port";
import { HttpCreateSessionAdapter } from "@gym/training/session/infrastructure/adapters/http-create-session.adapter";
import { CreateSessionService } from "@gym/training/session/application/services/create-session.service";

export class CreateSessionProviders {
  static getProviders(): Provider[] {
    return [
      { provide: CreateSessionPort, useClass: HttpCreateSessionAdapter },
      {
        provide: CreateSessionService,
        useFactory: (port: CreateSessionPort) => new CreateSessionService(port),
        deps: [CreateSessionPort],
      },
    ];
  }
}
