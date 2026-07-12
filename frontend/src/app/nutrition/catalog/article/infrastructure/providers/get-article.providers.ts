import { Provider } from "@angular/core";
import { GetArticlePort } from "@nutrition/catalog/article/domain/ports/get-article.port";
import { HttpGetArticleAdapter } from "@nutrition/catalog/article/infrastructure/adapters/http-get-article.adapter";
import { GetArticleService } from "@nutrition/catalog/article/application/services/get-article.service";
import { ArticleViewService } from "@nutrition/catalog/article/application/services/article-view.service";

export class GetArticleProviders {
  static getProviders(): Provider[] {
    return [
      ArticleViewService,
      { provide: GetArticlePort, useClass: HttpGetArticleAdapter },
      {
        provide: GetArticleService,
        useFactory: (port: GetArticlePort) => new GetArticleService(port),
        deps: [GetArticlePort],
      },
    ];
  }
}
