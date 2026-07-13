import { Routes } from "@angular/router";
import { blockReadOnlyUserGuard } from "@authorization/login/login/domain/guards/role.guard";
import { GetArticlesProviders } from "../providers/get-articles.providers";
import { GetArticleProviders } from "../providers/get-article.providers";
import { CreateArticleProviders } from "../providers/create-article.providers";
import { UpdateArticleProviders } from "../providers/update-article.providers";
import { DeleteArticleProviders } from "../providers/delete-article.providers";
import { GetCategoriesProviders } from "@nutrition/catalog/category/infrastructure/providers/get-categories.providers";
import { GetSupermarketsProviders } from "@nutrition/catalog/supermarket/infrastructure/providers/get-supermarkets.providers";
import { EmojiCatalogService } from "../../application/services/emoji-catalog.service";

export const ARTICLE_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetArticlesProviders.getProviders(),
      ...GetArticleProviders.getProviders(),
      ...CreateArticleProviders.getProviders(),
      ...UpdateArticleProviders.getProviders(),
      ...DeleteArticleProviders.getProviders(),
      ...GetCategoriesProviders.getProviders(),
      ...GetSupermarketsProviders.getProviders(),
      EmojiCatalogService,
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
        path: "create",
        canActivate: [blockReadOnlyUserGuard],
        data: { breadcrumb: "article.breadcrumb.create" },
        loadComponent: () =>
          import("../components/article-editor.component").then(
            (m) => m.ArticleEditorComponent,
          ),
      },
      {
        path: ":id/edit",
        canActivate: [blockReadOnlyUserGuard],
        data: { breadcrumb: "article.breadcrumb.edit" },
        loadComponent: () =>
          import("../components/article-editor.component").then(
            (m) => m.ArticleEditorComponent,
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
