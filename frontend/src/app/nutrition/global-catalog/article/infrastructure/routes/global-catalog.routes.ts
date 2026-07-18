import { Routes } from "@angular/router";
import { blockReadOnlyUserGuard } from "@authorization/login/login/domain/guards/role.guard";
import { GetGlobalArticlesProviders } from "../providers/get-global-articles.providers";

export const GLOBAL_CATALOG_ROUTES: Routes = [
  {
    path: "",
    canActivate: [blockReadOnlyUserGuard],
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
