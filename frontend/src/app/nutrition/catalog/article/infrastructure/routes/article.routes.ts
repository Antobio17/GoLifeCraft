import { Routes } from "@angular/router";
import { GetArticlesProviders } from "../providers/get-articles.providers";
import { GetArticleProviders } from "../providers/get-article.providers";

export const ARTICLE_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetArticlesProviders.getProviders(),
      ...GetArticleProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-articles.component").then(
            (m) => m.GetArticlesComponent,
          ),
      },
      {
        path: ":id",
        data: { breadcrumb: "article.breadcrumb.detail" },
        loadComponent: () =>
          import("../components/get-article.component").then(
            (m) => m.GetArticleComponent,
          ),
      },
    ],
  },
];
