import { Provider } from "@angular/core";
import { GetCategoriesPort } from "@nutrition/catalog/category/domain/ports/get-categories.port";
import { HttpGetCategoriesAdapter } from "@nutrition/catalog/category/infrastructure/adapters/http-get-categories.adapter";
import { GetCategoriesService } from "@nutrition/catalog/category/application/services/get-categories.service";

export class GetCategoriesProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetCategoriesPort, useClass: HttpGetCategoriesAdapter },
      {
        provide: GetCategoriesService,
        useFactory: (port: GetCategoriesPort) => new GetCategoriesService(port),
        deps: [GetCategoriesPort],
      },
    ];
  }
}
