import { Provider } from "@angular/core";
import { GetPantryLocationsPort } from "@nutrition/pantry/location/domain/ports/get-pantry-locations.port";
import { HttpGetPantryLocationsAdapter } from "@nutrition/pantry/location/infrastructure/adapters/http-get-pantry-locations.adapter";
import { GetPantryLocationsService } from "@nutrition/pantry/location/application/services/get-pantry-locations.service";

export class GetPantryLocationsProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetPantryLocationsPort,
        useClass: HttpGetPantryLocationsAdapter,
      },
      {
        provide: GetPantryLocationsService,
        useFactory: (port: GetPantryLocationsPort) =>
          new GetPantryLocationsService(port),
        deps: [GetPantryLocationsPort],
      },
    ];
  }
}
