import { Provider } from "@angular/core";
import { GetPantryLocationCandidatesPort } from "@nutrition/pantry/location/domain/ports/get-pantry-location-candidates.port";
import { HttpGetPantryLocationCandidatesAdapter } from "@nutrition/pantry/location/infrastructure/adapters/http-get-pantry-location-candidates.adapter";
import { GetPantryLocationCandidatesService } from "@nutrition/pantry/location/application/services/get-pantry-location-candidates.service";

export class GetPantryLocationCandidatesProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetPantryLocationCandidatesPort,
        useClass: HttpGetPantryLocationCandidatesAdapter,
      },
      {
        provide: GetPantryLocationCandidatesService,
        useFactory: (port: GetPantryLocationCandidatesPort) =>
          new GetPantryLocationCandidatesService(port),
        deps: [GetPantryLocationCandidatesPort],
      },
    ];
  }
}
