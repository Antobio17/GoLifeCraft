import { Provider } from "@angular/core";
import { AssignPantryLocationItemPort } from "@nutrition/pantry/location/domain/ports/assign-pantry-location-item.port";
import { HttpAssignPantryLocationItemAdapter } from "@nutrition/pantry/location/infrastructure/adapters/http-assign-pantry-location-item.adapter";
import { AssignPantryLocationItemService } from "@nutrition/pantry/location/application/services/assign-pantry-location-item.service";

export class AssignPantryLocationItemProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: AssignPantryLocationItemPort,
        useClass: HttpAssignPantryLocationItemAdapter,
      },
      {
        provide: AssignPantryLocationItemService,
        useFactory: (port: AssignPantryLocationItemPort) =>
          new AssignPantryLocationItemService(port),
        deps: [AssignPantryLocationItemPort],
      },
    ];
  }
}
