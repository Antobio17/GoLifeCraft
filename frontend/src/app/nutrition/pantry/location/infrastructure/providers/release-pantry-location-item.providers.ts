import { Provider } from "@angular/core";
import { ReleasePantryLocationItemPort } from "@nutrition/pantry/location/domain/ports/release-pantry-location-item.port";
import { HttpReleasePantryLocationItemAdapter } from "@nutrition/pantry/location/infrastructure/adapters/http-release-pantry-location-item.adapter";
import { ReleasePantryLocationItemService } from "@nutrition/pantry/location/application/services/release-pantry-location-item.service";

export class ReleasePantryLocationItemProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: ReleasePantryLocationItemPort,
        useClass: HttpReleasePantryLocationItemAdapter,
      },
      {
        provide: ReleasePantryLocationItemService,
        useFactory: (port: ReleasePantryLocationItemPort) =>
          new ReleasePantryLocationItemService(port),
        deps: [ReleasePantryLocationItemPort],
      },
    ];
  }
}
