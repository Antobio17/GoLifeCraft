import { Provider } from "@angular/core";
import { AdjustProductionItemIngredientsPort } from "@nutrition/kitchen/production/domain/ports/adjust-production-item-ingredients.port";
import { HttpAdjustProductionItemIngredientsAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-adjust-production-item-ingredients.adapter";
import { AdjustProductionItemIngredientsService } from "@nutrition/kitchen/production/application/services/adjust-production-item-ingredients.service";

export class AdjustProductionItemIngredientsProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: AdjustProductionItemIngredientsPort,
        useClass: HttpAdjustProductionItemIngredientsAdapter,
      },
      {
        provide: AdjustProductionItemIngredientsService,
        useFactory: (port: AdjustProductionItemIngredientsPort) =>
          new AdjustProductionItemIngredientsService(port),
        deps: [AdjustProductionItemIngredientsPort],
      },
    ];
  }
}
