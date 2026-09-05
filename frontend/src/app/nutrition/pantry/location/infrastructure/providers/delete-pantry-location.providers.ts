import { Provider } from "@angular/core";
import { DeletePantryLocationPort } from "@nutrition/pantry/location/domain/ports/delete-pantry-location.port";
import { HttpDeletePantryLocationAdapter } from "@nutrition/pantry/location/infrastructure/adapters/http-delete-pantry-location.adapter";
import { DeletePantryLocationService } from "@nutrition/pantry/location/application/services/delete-pantry-location.service";

export class DeletePantryLocationProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: DeletePantryLocationPort,
        useClass: HttpDeletePantryLocationAdapter,
      },
      {
        provide: DeletePantryLocationService,
        useFactory: (port: DeletePantryLocationPort) =>
          new DeletePantryLocationService(port),
        deps: [DeletePantryLocationPort],
      },
    ];
  }
}
