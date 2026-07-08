import { Provider } from "@angular/core";
import { DeleteSessionPort } from "@gym/training/session/domain/ports/delete-session.port";
import { HttpDeleteSessionAdapter } from "@gym/training/session/infrastructure/adapters/http-delete-session.adapter";
import { DeleteSessionService } from "@gym/training/session/application/services/delete-session.service";

export class DeleteSessionProviders {
  static getProviders(): Provider[] {
    return [
      { provide: DeleteSessionPort, useClass: HttpDeleteSessionAdapter },
      {
        provide: DeleteSessionService,
        useFactory: (port: DeleteSessionPort) => new DeleteSessionService(port),
        deps: [DeleteSessionPort],
      },
    ];
  }
}
