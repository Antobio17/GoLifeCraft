import { Provider } from "@angular/core";
import { UpdatePantryLocationPort } from "@nutrition/pantry/location/domain/ports/update-pantry-location.port";
import { HttpUpdatePantryLocationAdapter } from "@nutrition/pantry/location/infrastructure/adapters/http-update-pantry-location.adapter";
import { UpdatePantryLocationService } from "@nutrition/pantry/location/application/services/update-pantry-location.service";

export class UpdatePantryLocationProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: UpdatePantryLocationPort,
        useClass: HttpUpdatePantryLocationAdapter,
      },
      {
        provide: UpdatePantryLocationService,
        useFactory: (port: UpdatePantryLocationPort) =>
          new UpdatePantryLocationService(port),
        deps: [UpdatePantryLocationPort],
      },
    ];
  }
}
