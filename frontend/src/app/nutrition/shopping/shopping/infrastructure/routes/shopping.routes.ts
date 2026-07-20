import { Routes } from "@angular/router";
import { GetArticlesProviders } from "@nutrition/catalog/article/infrastructure/providers/get-articles.providers";
import { GetShoppingListProviders } from "../providers/get-shopping-list.providers";
import { ShoppingWriteProviders } from "../providers/shopping-write.providers";

export const SHOPPING_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetShoppingListProviders.getProviders(),
      ...ShoppingWriteProviders.getProviders(),
      ...GetArticlesProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-shopping-list.component").then(
            (m) => m.GetShoppingListComponent,
          ),
      },
    ],
  },
];
