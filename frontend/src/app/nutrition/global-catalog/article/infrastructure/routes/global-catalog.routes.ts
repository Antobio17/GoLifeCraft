import { Routes } from "@angular/router";
import { GetGlobalArticlesProviders } from "../providers/get-global-articles.providers";
import { GetGlobalArticleProviders } from "../providers/get-global-article.providers";

export const GLOBAL_CATALOG_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetGlobalArticlesProviders.getProviders(),
      ...GetGlobalArticleProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-global-articles.component").then(
            (m) => m.GetGlobalArticlesComponent,
          ),
      },
      {
        path: ":id",
        data: { breadcrumb: "getGlobalArticle.breadcrumb.detail" },
        loadComponent: () =>
          import("../components/get-global-article.component").then(
            (m) => m.GetGlobalArticleComponent,
          ),
      },
    ],
  },
];
