import { Provider } from "@angular/core";
import { CreatePantryLocationPort } from "@nutrition/pantry/location/domain/ports/create-pantry-location.port";
import { HttpCreatePantryLocationAdapter } from "@nutrition/pantry/location/infrastructure/adapters/http-create-pantry-location.adapter";
import { CreatePantryLocationService } from "@nutrition/pantry/location/application/services/create-pantry-location.service";

export class CreatePantryLocationProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: CreatePantryLocationPort,
        useClass: HttpCreatePantryLocationAdapter,
      },
      {
        provide: CreatePantryLocationService,
        useFactory: (port: CreatePantryLocationPort) =>
          new CreatePantryLocationService(port),
        deps: [CreatePantryLocationPort],
      },
    ];
  }
}
