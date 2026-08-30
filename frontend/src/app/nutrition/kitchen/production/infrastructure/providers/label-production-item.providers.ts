import { Provider } from "@angular/core";
import { LabelProductionItemPort } from "@nutrition/kitchen/production/domain/ports/label-production-item.port";
import { HttpLabelProductionItemAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-label-production-item.adapter";
import { LabelProductionItemService } from "@nutrition/kitchen/production/application/services/label-production-item.service";

export class LabelProductionItemProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: LabelProductionItemPort,
        useClass: HttpLabelProductionItemAdapter,
      },
      {
        provide: LabelProductionItemService,
        useFactory: (port: LabelProductionItemPort) =>
          new LabelProductionItemService(port),
        deps: [LabelProductionItemPort],
      },
    ];
  }
}
