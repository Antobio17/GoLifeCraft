import { Provider } from "@angular/core";
import { GetRecipeLotsPort } from "@nutrition/kitchen/production/domain/ports/get-recipe-lots.port";
import { HttpGetRecipeLotsAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-get-recipe-lots.adapter";
import { GetRecipeLotsService } from "@nutrition/kitchen/production/application/services/get-recipe-lots.service";

export class GetRecipeLotsProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetRecipeLotsPort, useClass: HttpGetRecipeLotsAdapter },
      {
        provide: GetRecipeLotsService,
        useFactory: (port: GetRecipeLotsPort) => new GetRecipeLotsService(port),
        deps: [GetRecipeLotsPort],
      },
    ];
  }
}
