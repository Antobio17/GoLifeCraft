import { Provider } from "@angular/core";
import { UpdateArticlePort } from "@nutrition/catalog/article/domain/ports/update-article.port";
import { HttpUpdateArticleAdapter } from "@nutrition/catalog/article/infrastructure/adapters/http-update-article.adapter";
import { UpdateArticleService } from "@nutrition/catalog/article/application/services/update-article.service";

export class UpdateArticleProviders {
  static getProviders(): Provider[] {
    return [
      { provide: UpdateArticlePort, useClass: HttpUpdateArticleAdapter },
      {
        provide: UpdateArticleService,
        useFactory: (port: UpdateArticlePort) => new UpdateArticleService(port),
        deps: [UpdateArticlePort],
      },
    ];
  }
}
