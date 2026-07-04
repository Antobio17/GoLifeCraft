import { Provider } from "@angular/core";
import { GetSupermarketsPort } from "@nutrition/catalog/supermarket/domain/ports/get-supermarkets.port";
import { HttpGetSupermarketsAdapter } from "@nutrition/catalog/supermarket/infrastructure/adapters/http-get-supermarkets.adapter";
import { GetSupermarketsService } from "@nutrition/catalog/supermarket/application/services/get-supermarkets.service";

export class GetSupermarketsProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetSupermarketsPort, useClass: HttpGetSupermarketsAdapter },
      {
        provide: GetSupermarketsService,
        useFactory: (port: GetSupermarketsPort) =>
          new GetSupermarketsService(port),
        deps: [GetSupermarketsPort],
      },
    ];
  }
}
