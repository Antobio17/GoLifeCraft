import { Provider } from "@angular/core";
import { UpdateSessionDetailsPort } from "@gym/training/session/domain/ports/update-session-details.port";
import { HttpUpdateSessionDetailsAdapter } from "@gym/training/session/infrastructure/adapters/http-update-session-details.adapter";
import { UpdateSessionDetailsService } from "@gym/training/session/application/services/update-session-details.service";

export class UpdateSessionDetailsProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: UpdateSessionDetailsPort,
        useClass: HttpUpdateSessionDetailsAdapter,
      },
      {
        provide: UpdateSessionDetailsService,
        useFactory: (port: UpdateSessionDetailsPort) =>
          new UpdateSessionDetailsService(port),
        deps: [UpdateSessionDetailsPort],
      },
    ];
  }
}
