import { Provider } from "@angular/core";
import { GetGlobalArticlesPort } from "@nutrition/global-catalog/article/domain/ports/get-global-articles.port";
import { ImportGlobalArticlePort } from "@nutrition/global-catalog/article/domain/ports/import-global-article.port";
import { HttpGetGlobalArticlesAdapter } from "@nutrition/global-catalog/article/infrastructure/adapters/http-get-global-articles.adapter";
import { HttpImportGlobalArticleAdapter } from "@nutrition/global-catalog/article/infrastructure/adapters/http-import-global-article.adapter";
import { GetGlobalArticlesService } from "@nutrition/global-catalog/article/application/services/get-global-articles.service";
import { ImportGlobalArticleService } from "@nutrition/global-catalog/article/application/services/import-global-article.service";
import { GlobalArticleViewService } from "@nutrition/global-catalog/article/application/services/global-article-view.service";

export class GetGlobalArticlesProviders {
  static getProviders(): Provider[] {
    return [
      GlobalArticleViewService,
      {
        provide: GetGlobalArticlesPort,
        useClass: HttpGetGlobalArticlesAdapter,
      },
      {
        provide: ImportGlobalArticlePort,
        useClass: HttpImportGlobalArticleAdapter,
      },
      {
        provide: GetGlobalArticlesService,
        useFactory: (port: GetGlobalArticlesPort) =>
          new GetGlobalArticlesService(port),
        deps: [GetGlobalArticlesPort],
      },
      {
        provide: ImportGlobalArticleService,
        useFactory: (port: ImportGlobalArticlePort) =>
          new ImportGlobalArticleService(port),
        deps: [ImportGlobalArticlePort],
      },
    ];
  }
}
