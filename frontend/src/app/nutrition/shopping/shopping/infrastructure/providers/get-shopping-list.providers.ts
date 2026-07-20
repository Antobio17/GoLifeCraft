import { Provider } from "@angular/core";
import { ArticleViewService } from "@nutrition/catalog/article/application/services/article-view.service";
import { GetShoppingListPort } from "@nutrition/shopping/shopping/domain/ports/get-shopping-list.port";
import { HttpGetShoppingListAdapter } from "@nutrition/shopping/shopping/infrastructure/adapters/http-get-shopping-list.adapter";
import { GetShoppingListService } from "@nutrition/shopping/shopping/application/services/get-shopping-list.service";
import { ShoppingListViewService } from "@nutrition/shopping/shopping/application/services/shopping-list-view.service";

export class GetShoppingListProviders {
  static getProviders(): Provider[] {
    return [
      ArticleViewService,
      ShoppingListViewService,
      { provide: GetShoppingListPort, useClass: HttpGetShoppingListAdapter },
      {
        provide: GetShoppingListService,
        useFactory: (port: GetShoppingListPort) =>
          new GetShoppingListService(port),
        deps: [GetShoppingListPort],
      },
    ];
  }
}
