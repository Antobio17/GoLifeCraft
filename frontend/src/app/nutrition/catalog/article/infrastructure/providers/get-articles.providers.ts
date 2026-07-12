import { Provider } from "@angular/core";
import { GetArticlesPort } from "@nutrition/catalog/article/domain/ports/get-articles.port";
import { HttpGetArticlesAdapter } from "@nutrition/catalog/article/infrastructure/adapters/http-get-articles.adapter";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
import { ArticleViewService } from "@nutrition/catalog/article/application/services/article-view.service";

export class GetArticlesProviders {
  static getProviders(): Provider[] {
    return [
      ArticleViewService,
      { provide: GetArticlesPort, useClass: HttpGetArticlesAdapter },
      {
        provide: GetArticlesService,
        useFactory: (port: GetArticlesPort) => new GetArticlesService(port),
        deps: [GetArticlesPort],
      },
    ];
  }
}
