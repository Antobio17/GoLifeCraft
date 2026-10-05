import { Provider } from "@angular/core";
import { RescheduleInventoryPort } from "@nutrition/pantry/inventory/domain/ports/reschedule-inventory.port";
import { HttpRescheduleInventoryAdapter } from "@nutrition/pantry/inventory/infrastructure/adapters/http-reschedule-inventory.adapter";
import { RescheduleInventoryService } from "@nutrition/pantry/inventory/application/services/reschedule-inventory.service";

export class RescheduleInventoryProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: RescheduleInventoryPort,
        useClass: HttpRescheduleInventoryAdapter,
      },
      {
        provide: RescheduleInventoryService,
        useFactory: (port: RescheduleInventoryPort) =>
          new RescheduleInventoryService(port),
        deps: [RescheduleInventoryPort],
      },
    ];
  }
}
