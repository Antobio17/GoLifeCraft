import { Routes } from "@angular/router";
import { GetArticlesProviders } from "../providers/get-articles.providers";
import { GetArticleProviders } from "../providers/get-article.providers";
import { CreateArticleProviders } from "../providers/create-article.providers";
import { UpdateArticleProviders } from "../providers/update-article.providers";
import { DeleteArticleProviders } from "../providers/delete-article.providers";
import { UpdateArticleStockProviders } from "@nutrition/pantry/stock/infrastructure/providers/update-article-stock.providers";
import { MoveArticleStockProviders } from "@nutrition/pantry/stock/infrastructure/providers/move-article-stock.providers";
import { GetPantryLocationsProviders } from "@nutrition/pantry/location/infrastructure/providers/get-pantry-locations.providers";
import { GetCategoriesProviders } from "@nutrition/catalog/category/infrastructure/providers/get-categories.providers";
import { GetSupermarketsProviders } from "@nutrition/catalog/supermarket/infrastructure/providers/get-supermarkets.providers";
import { UpdateSupermarketAislesProviders } from "@nutrition/catalog/supermarket/infrastructure/providers/update-supermarket-aisles.providers";
import { GetArticleDraftProviders } from "../providers/get-article-draft.providers";
import { ImportGlobalArticleProviders } from "@nutrition/global-catalog/article/infrastructure/providers/import-global-article.providers";
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
      ...UpdateArticleStockProviders.getProviders(),
      ...MoveArticleStockProviders.getProviders(),
      ...GetPantryLocationsProviders.getProviders(),
      ...GetCategoriesProviders.getProviders(),
      ...GetSupermarketsProviders.getProviders(),
      ...UpdateSupermarketAislesProviders.getProviders(),
      ...GetArticleDraftProviders.getProviders(),
      ...ImportGlobalArticleProviders.getProviders(),
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
        path: "scan",
        data: { breadcrumb: "article.breadcrumb.scan" },
        loadComponent: () =>
          import("../components/scan-article.component").then(
            (m) => m.ScanArticleComponent,
          ),
      },
      {
        path: "create",
        data: { breadcrumb: "article.breadcrumb.create" },
        loadComponent: () =>
          import("../components/article-editor.component").then(
            (m) => m.ArticleEditorComponent,
          ),
      },
      {
        path: ":id/edit",
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
