import { Provider } from "@angular/core";
import { GetPantryLocationItemsPort } from "@nutrition/pantry/location/domain/ports/get-pantry-location-items.port";
import { HttpGetPantryLocationItemsAdapter } from "@nutrition/pantry/location/infrastructure/adapters/http-get-pantry-location-items.adapter";
import { GetPantryLocationItemsService } from "@nutrition/pantry/location/application/services/get-pantry-location-items.service";

export class GetPantryLocationItemsProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetPantryLocationItemsPort,
        useClass: HttpGetPantryLocationItemsAdapter,
      },
      {
        provide: GetPantryLocationItemsService,
        useFactory: (port: GetPantryLocationItemsPort) =>
          new GetPantryLocationItemsService(port),
        deps: [GetPantryLocationItemsPort],
      },
    ];
  }
}
