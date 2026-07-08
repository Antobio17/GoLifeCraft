import { Provider } from "@angular/core";
import { UpdateSessionPort } from "@gym/training/session/domain/ports/update-session.port";
import { HttpUpdateSessionAdapter } from "@gym/training/session/infrastructure/adapters/http-update-session.adapter";
import { UpdateSessionService } from "@gym/training/session/application/services/update-session.service";

export class UpdateSessionProviders {
  static getProviders(): Provider[] {
    return [
      { provide: UpdateSessionPort, useClass: HttpUpdateSessionAdapter },
      {
        provide: UpdateSessionService,
        useFactory: (port: UpdateSessionPort) => new UpdateSessionService(port),
        deps: [UpdateSessionPort],
      },
    ];
  }
}
