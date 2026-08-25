import { Routes } from "@angular/router";
import { GetSupermarketsProviders } from "../providers/get-supermarkets.providers";
import { GetSupermarketProviders } from "../providers/get-supermarket.providers";
import { CreateSupermarketProviders } from "../providers/create-supermarket.providers";
import { UpdateSupermarketProviders } from "../providers/update-supermarket.providers";

export const SUPERMARKET_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetSupermarketsProviders.getProviders(),
      ...GetSupermarketProviders.getProviders(),
      ...CreateSupermarketProviders.getProviders(),
      ...UpdateSupermarketProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-supermarkets.component").then(
            (m) => m.GetSupermarketsComponent,
          ),
      },
      {
        path: "create",
        data: { breadcrumb: "supermarket.breadcrumb.create" },
        loadComponent: () =>
          import("../components/create-supermarket.component").then(
            (m) => m.CreateSupermarketComponent,
          ),
      },
      {
        path: ":id/edit",
        data: { breadcrumb: "supermarket.breadcrumb.edit" },
        loadComponent: () =>
          import("../components/update-supermarket.component").then(
            (m) => m.UpdateSupermarketComponent,
          ),
      },
    ],
  },
];
