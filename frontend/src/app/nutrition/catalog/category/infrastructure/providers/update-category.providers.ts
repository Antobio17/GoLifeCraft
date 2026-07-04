import { Provider } from "@angular/core";
import { UpdateCategoryPort } from "@nutrition/catalog/category/domain/ports/update-category.port";
import { HttpUpdateCategoryAdapter } from "@nutrition/catalog/category/infrastructure/adapters/http-update-category.adapter";
import { UpdateCategoryService } from "@nutrition/catalog/category/application/services/update-category.service";

export class UpdateCategoryProviders {
  static getProviders(): Provider[] {
    return [
      { provide: UpdateCategoryPort, useClass: HttpUpdateCategoryAdapter },
      {
        provide: UpdateCategoryService,
        useFactory: (port: UpdateCategoryPort) =>
          new UpdateCategoryService(port),
        deps: [UpdateCategoryPort],
      },
    ];
  }
}
