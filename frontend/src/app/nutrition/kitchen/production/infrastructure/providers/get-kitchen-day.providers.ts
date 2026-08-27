import { Provider } from "@angular/core";
import { GetKitchenDayPort } from "@nutrition/kitchen/production/domain/ports/get-kitchen-day.port";
import { InMemoryGetKitchenDayAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/in-memory-get-kitchen-day.adapter";
import { GetKitchenDayService } from "@nutrition/kitchen/production/application/services/get-kitchen-day.service";

export class GetKitchenDayProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetKitchenDayPort, useClass: InMemoryGetKitchenDayAdapter },
      {
        provide: GetKitchenDayService,
        useFactory: (port: GetKitchenDayPort) => new GetKitchenDayService(port),
        deps: [GetKitchenDayPort],
      },
    ];
  }
}
