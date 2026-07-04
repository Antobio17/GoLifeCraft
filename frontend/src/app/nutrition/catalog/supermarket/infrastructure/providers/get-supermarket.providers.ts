import { Provider } from "@angular/core";
import { GetSupermarketPort } from "@nutrition/catalog/supermarket/domain/ports/get-supermarket.port";
import { HttpGetSupermarketAdapter } from "@nutrition/catalog/supermarket/infrastructure/adapters/http-get-supermarket.adapter";
import { GetSupermarketService } from "@nutrition/catalog/supermarket/application/services/get-supermarket.service";

export class GetSupermarketProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetSupermarketPort, useClass: HttpGetSupermarketAdapter },
      {
        provide: GetSupermarketService,
        useFactory: (port: GetSupermarketPort) =>
          new GetSupermarketService(port),
        deps: [GetSupermarketPort],
      },
    ];
  }
}
