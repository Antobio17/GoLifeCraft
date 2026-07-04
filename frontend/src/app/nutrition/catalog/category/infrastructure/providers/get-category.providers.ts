import { Provider } from "@angular/core";
import { GetCategoryPort } from "@nutrition/catalog/category/domain/ports/get-category.port";
import { HttpGetCategoryAdapter } from "@nutrition/catalog/category/infrastructure/adapters/http-get-category.adapter";
import { GetCategoryService } from "@nutrition/catalog/category/application/services/get-category.service";

export class GetCategoryProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetCategoryPort, useClass: HttpGetCategoryAdapter },
      {
        provide: GetCategoryService,
        useFactory: (port: GetCategoryPort) => new GetCategoryService(port),
        deps: [GetCategoryPort],
      },
    ];
  }
}
