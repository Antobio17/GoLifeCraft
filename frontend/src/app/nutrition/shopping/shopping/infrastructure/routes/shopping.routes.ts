import { Routes } from "@angular/router";
import { GetArticlesProviders } from "@nutrition/catalog/article/infrastructure/providers/get-articles.providers";
import { GetSupermarketsProviders } from "@nutrition/catalog/supermarket/infrastructure/providers/get-supermarkets.providers";
import { UpdateSupermarketAislesProviders } from "@nutrition/catalog/supermarket/infrastructure/providers/update-supermarket-aisles.providers";
import { GetDiaryShoppingNeedsProviders } from "@nutrition/diary/diary/infrastructure/providers/get-diary-shopping-needs.providers";
import { DiaryShoppingViewService } from "@nutrition/shopping/shopping/application/services/diary-shopping-view.service";
import { GetShoppingListProviders } from "../providers/get-shopping-list.providers";
import { ShoppingWriteProviders } from "../providers/shopping-write.providers";

export const SHOPPING_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetShoppingListProviders.getProviders(),
      ...ShoppingWriteProviders.getProviders(),
      ...GetArticlesProviders.getProviders(),
      ...GetSupermarketsProviders.getProviders(),
      ...UpdateSupermarketAislesProviders.getProviders(),
      ...GetDiaryShoppingNeedsProviders.getProviders(),
      DiaryShoppingViewService,
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
