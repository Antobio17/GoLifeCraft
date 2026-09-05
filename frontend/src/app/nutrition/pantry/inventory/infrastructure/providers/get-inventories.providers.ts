import { Provider } from "@angular/core";
import { GetInventoriesPort } from "@nutrition/pantry/inventory/domain/ports/get-inventories.port";
import { HttpGetInventoriesAdapter } from "@nutrition/pantry/inventory/infrastructure/adapters/http-get-inventories.adapter";
import { GetInventoriesService } from "@nutrition/pantry/inventory/application/services/get-inventories.service";

export class GetInventoriesProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetInventoriesPort, useClass: HttpGetInventoriesAdapter },
      {
        provide: GetInventoriesService,
        useFactory: (port: GetInventoriesPort) =>
          new GetInventoriesService(port),
        deps: [GetInventoriesPort],
      },
    ];
  }
}
