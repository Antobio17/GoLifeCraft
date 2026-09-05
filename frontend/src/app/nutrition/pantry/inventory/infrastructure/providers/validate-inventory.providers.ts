import { Provider } from "@angular/core";
import { ValidateInventoryPort } from "@nutrition/pantry/inventory/domain/ports/validate-inventory.port";
import { HttpValidateInventoryAdapter } from "@nutrition/pantry/inventory/infrastructure/adapters/http-validate-inventory.adapter";
import { ValidateInventoryService } from "@nutrition/pantry/inventory/application/services/validate-inventory.service";

export class ValidateInventoryProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: ValidateInventoryPort,
        useClass: HttpValidateInventoryAdapter,
      },
      {
        provide: ValidateInventoryService,
        useFactory: (port: ValidateInventoryPort) =>
          new ValidateInventoryService(port),
        deps: [ValidateInventoryPort],
      },
    ];
  }
}
