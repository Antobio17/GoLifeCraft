import { Provider } from "@angular/core";
import { GetPantryLocationPort } from "@nutrition/pantry/location/domain/ports/get-pantry-location.port";
import { HttpGetPantryLocationAdapter } from "@nutrition/pantry/location/infrastructure/adapters/http-get-pantry-location.adapter";
import { GetPantryLocationService } from "@nutrition/pantry/location/application/services/get-pantry-location.service";

export class GetPantryLocationProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetPantryLocationPort,
        useClass: HttpGetPantryLocationAdapter,
      },
      {
        provide: GetPantryLocationService,
        useFactory: (port: GetPantryLocationPort) =>
          new GetPantryLocationService(port),
        deps: [GetPantryLocationPort],
      },
    ];
  }
}
