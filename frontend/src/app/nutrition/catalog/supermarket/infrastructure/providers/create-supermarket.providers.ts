import { Provider } from "@angular/core";
import { CreateSupermarketPort } from "@nutrition/catalog/supermarket/domain/ports/create-supermarket.port";
import { HttpCreateSupermarketAdapter } from "@nutrition/catalog/supermarket/infrastructure/adapters/http-create-supermarket.adapter";
import { CreateSupermarketService } from "@nutrition/catalog/supermarket/application/services/create-supermarket.service";

export class CreateSupermarketProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: CreateSupermarketPort,
        useClass: HttpCreateSupermarketAdapter,
      },
      {
        provide: CreateSupermarketService,
        useFactory: (port: CreateSupermarketPort) =>
          new CreateSupermarketService(port),
        deps: [CreateSupermarketPort],
      },
    ];
  }
}
