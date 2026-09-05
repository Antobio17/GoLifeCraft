import { Routes } from "@angular/router";
import { GetInventoriesProviders } from "../providers/get-inventories.providers";
import { GetInventoryProviders } from "../providers/get-inventory.providers";
import { StartInventoryProviders } from "../providers/start-inventory.providers";
import { CountInventoryLineProviders } from "../providers/count-inventory-line.providers";
import { ValidateInventoryProviders } from "../providers/validate-inventory.providers";
import { DiscardInventoryProviders } from "../providers/discard-inventory.providers";
import { GetPantryLocationsProviders } from "@nutrition/pantry/location/infrastructure/providers/get-pantry-locations.providers";

export const INVENTORY_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetInventoriesProviders.getProviders(),
      ...GetInventoryProviders.getProviders(),
      ...StartInventoryProviders.getProviders(),
      ...CountInventoryLineProviders.getProviders(),
      ...ValidateInventoryProviders.getProviders(),
      ...DiscardInventoryProviders.getProviders(),
      ...GetPantryLocationsProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-inventories.component").then(
            (m) => m.GetInventoriesComponent,
          ),
      },
      {
        path: "start",
        data: { breadcrumb: "inventory.breadcrumb.start" },
        loadComponent: () =>
          import("../components/start-inventory.component").then(
            (m) => m.StartInventoryComponent,
          ),
      },
      {
        path: ":id",
        data: { breadcrumb: "inventory.breadcrumb.detail" },
        loadComponent: () =>
          import("../components/get-inventory.component").then(
            (m) => m.GetInventoryComponent,
          ),
      },
    ],
  },
];
