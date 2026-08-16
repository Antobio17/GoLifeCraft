import { Routes } from "@angular/router";
import { GetEconomyProviders } from "../providers/get-economy.providers";
import { EconomyWriteProviders } from "../providers/economy-write.providers";

export const ECONOMY_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetEconomyProviders.getProviders(),
      ...EconomyWriteProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-economy.component").then(
            (m) => m.GetEconomyComponent,
          ),
      },
    ],
  },
];
