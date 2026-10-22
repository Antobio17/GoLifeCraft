import { Provider } from "@angular/core";
import { UpdateGlobalArticlePort } from "@nutrition/global-catalog/article/domain/ports/update-global-article.port";
import { HttpUpdateGlobalArticleAdapter } from "@nutrition/global-catalog/article/infrastructure/adapters/http-update-global-article.adapter";
import { UpdateGlobalArticleService } from "@nutrition/global-catalog/article/application/services/update-global-article.service";

export class UpdateGlobalArticleProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: UpdateGlobalArticlePort,
        useClass: HttpUpdateGlobalArticleAdapter,
      },
      {
        provide: UpdateGlobalArticleService,
        useFactory: (port: UpdateGlobalArticlePort) =>
          new UpdateGlobalArticleService(port),
        deps: [UpdateGlobalArticlePort],
      },
    ];
  }
}
