import { Routes } from "@angular/router";
import { GetPantryLocationsProviders } from "../providers/get-pantry-locations.providers";
import { GetPantryLocationProviders } from "../providers/get-pantry-location.providers";
import { CreatePantryLocationProviders } from "../providers/create-pantry-location.providers";
import { UpdatePantryLocationProviders } from "../providers/update-pantry-location.providers";
import { DeletePantryLocationProviders } from "../providers/delete-pantry-location.providers";
import { GetPantryLocationItemsProviders } from "../providers/get-pantry-location-items.providers";
import { GetPantryLocationCandidatesProviders } from "../providers/get-pantry-location-candidates.providers";
import { MoveArticleStockProviders } from "@nutrition/pantry/stock/infrastructure/providers/move-article-stock.providers";
import { MoveRecipeStockProviders } from "@nutrition/pantry/recipe-stock/infrastructure/providers/move-recipe-stock.providers";

export const PANTRY_LOCATION_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetPantryLocationsProviders.getProviders(),
      ...GetPantryLocationProviders.getProviders(),
      ...CreatePantryLocationProviders.getProviders(),
      ...UpdatePantryLocationProviders.getProviders(),
      ...DeletePantryLocationProviders.getProviders(),
      ...GetPantryLocationItemsProviders.getProviders(),
      ...GetPantryLocationCandidatesProviders.getProviders(),
      ...MoveArticleStockProviders.getProviders(),
      ...MoveRecipeStockProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-pantry-locations.component").then(
            (m) => m.GetPantryLocationsComponent,
          ),
      },
      {
        path: "create",
        data: { breadcrumb: "pantryLocation.breadcrumb.create" },
        loadComponent: () =>
          import("../components/create-pantry-location.component").then(
            (m) => m.CreatePantryLocationComponent,
          ),
      },
      {
        path: ":id",
        data: { breadcrumb: "pantryLocation.breadcrumb.detail" },
        loadComponent: () =>
          import("../components/get-pantry-location.component").then(
            (m) => m.GetPantryLocationComponent,
          ),
      },
      {
        path: ":id/edit",
        data: { breadcrumb: "pantryLocation.breadcrumb.edit" },
        loadComponent: () =>
          import("../components/update-pantry-location.component").then(
            (m) => m.UpdatePantryLocationComponent,
          ),
      },
    ],
  },
];
