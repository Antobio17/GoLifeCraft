import { Provider } from "@angular/core";
import { CreateCategoryPort } from "@nutrition/catalog/category/domain/ports/create-category.port";
import { HttpCreateCategoryAdapter } from "@nutrition/catalog/category/infrastructure/adapters/http-create-category.adapter";
import { CreateCategoryService } from "@nutrition/catalog/category/application/services/create-category.service";

export class CreateCategoryProviders {
  static getProviders(): Provider[] {
    return [
      { provide: CreateCategoryPort, useClass: HttpCreateCategoryAdapter },
      {
        provide: CreateCategoryService,
        useFactory: (port: CreateCategoryPort) =>
          new CreateCategoryService(port),
        deps: [CreateCategoryPort],
      },
    ];
  }
}
