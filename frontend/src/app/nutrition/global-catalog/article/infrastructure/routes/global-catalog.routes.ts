import { Routes } from "@angular/router";
import { godOnlyGuard } from "@authorization/login/login/domain/guards/role.guard";
import { GetGlobalArticlesProviders } from "../providers/get-global-articles.providers";
import { GetGlobalArticleProviders } from "../providers/get-global-article.providers";
import { UpdateGlobalArticleProviders } from "../providers/update-global-article.providers";
import { GlobalArticleFormService } from "../../application/services/global-article-form.service";

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
      {
        path: ":id/edit",
        canActivate: [godOnlyGuard],
        data: { breadcrumb: "editGlobalArticle.breadcrumb" },
        providers: [
          ...UpdateGlobalArticleProviders.getProviders(),
          GlobalArticleFormService,
        ],
        loadComponent: () =>
          import("../components/edit-global-article.component").then(
            (m) => m.EditGlobalArticleComponent,
          ),
      },
    ],
  },
];
