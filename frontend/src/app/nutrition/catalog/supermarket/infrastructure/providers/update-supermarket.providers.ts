import { Provider } from "@angular/core";
import { UpdateSupermarketPort } from "@nutrition/catalog/supermarket/domain/ports/update-supermarket.port";
import { HttpUpdateSupermarketAdapter } from "@nutrition/catalog/supermarket/infrastructure/adapters/http-update-supermarket.adapter";
import { UpdateSupermarketService } from "@nutrition/catalog/supermarket/application/services/update-supermarket.service";

export class UpdateSupermarketProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: UpdateSupermarketPort,
        useClass: HttpUpdateSupermarketAdapter,
      },
      {
        provide: UpdateSupermarketService,
        useFactory: (port: UpdateSupermarketPort) =>
          new UpdateSupermarketService(port),
        deps: [UpdateSupermarketPort],
      },
    ];
  }
}
