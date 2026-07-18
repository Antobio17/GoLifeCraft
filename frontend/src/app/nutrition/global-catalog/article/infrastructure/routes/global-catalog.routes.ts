import { Routes } from "@angular/router";
import { GetGlobalArticlesProviders } from "../providers/get-global-articles.providers";

export const GLOBAL_CATALOG_ROUTES: Routes = [
  {
    path: "",
    providers: [...GetGlobalArticlesProviders.getProviders()],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-global-articles.component").then(
            (m) => m.GetGlobalArticlesComponent,
          ),
      },
    ],
  },
];
