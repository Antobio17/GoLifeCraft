import { Provider } from "@angular/core";
import { UpdateSupermarketAislesPort } from "@nutrition/catalog/supermarket/domain/ports/update-supermarket-aisles.port";
import { HttpUpdateSupermarketAislesAdapter } from "@nutrition/catalog/supermarket/infrastructure/adapters/http-update-supermarket-aisles.adapter";
import { UpdateSupermarketAislesService } from "@nutrition/catalog/supermarket/application/services/update-supermarket-aisles.service";
import { AisleCatalogService } from "@nutrition/catalog/supermarket/application/services/aisle-catalog.service";

export class UpdateSupermarketAislesProviders {
  static getProviders(): Provider[] {
    return [
      AisleCatalogService,
      {
        provide: UpdateSupermarketAislesPort,
        useClass: HttpUpdateSupermarketAislesAdapter,
      },
      {
        provide: UpdateSupermarketAislesService,
        useFactory: (port: UpdateSupermarketAislesPort) =>
          new UpdateSupermarketAislesService(port),
        deps: [UpdateSupermarketAislesPort],
      },
    ];
  }
}
