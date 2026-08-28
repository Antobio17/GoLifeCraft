import { Provider } from "@angular/core";
import { GetProductionsPort } from "@nutrition/kitchen/production/domain/ports/get-productions.port";
import { HttpGetProductionsAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-get-productions.adapter";
import { GetProductionsService } from "@nutrition/kitchen/production/application/services/get-productions.service";

export class GetProductionsProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetProductionsPort, useClass: HttpGetProductionsAdapter },
      {
        provide: GetProductionsService,
        useFactory: (port: GetProductionsPort) =>
          new GetProductionsService(port),
        deps: [GetProductionsPort],
      },
    ];
  }
}
