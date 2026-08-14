import { Provider } from "@angular/core";
import { GetGlobalArticlePort } from "@nutrition/global-catalog/article/domain/ports/get-global-article.port";
import { HttpGetGlobalArticleAdapter } from "@nutrition/global-catalog/article/infrastructure/adapters/http-get-global-article.adapter";
import { GetGlobalArticleService } from "@nutrition/global-catalog/article/application/services/get-global-article.service";

export class GetGlobalArticleProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetGlobalArticlePort,
        useClass: HttpGetGlobalArticleAdapter,
      },
      {
        provide: GetGlobalArticleService,
        useFactory: (port: GetGlobalArticlePort) =>
          new GetGlobalArticleService(port),
        deps: [GetGlobalArticlePort],
      },
    ];
  }
}
