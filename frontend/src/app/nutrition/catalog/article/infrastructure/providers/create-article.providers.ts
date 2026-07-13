import { Provider } from "@angular/core";
import { CreateArticlePort } from "@nutrition/catalog/article/domain/ports/create-article.port";
import { HttpCreateArticleAdapter } from "@nutrition/catalog/article/infrastructure/adapters/http-create-article.adapter";
import { CreateArticleService } from "@nutrition/catalog/article/application/services/create-article.service";

export class CreateArticleProviders {
  static getProviders(): Provider[] {
    return [
      { provide: CreateArticlePort, useClass: HttpCreateArticleAdapter },
      {
        provide: CreateArticleService,
        useFactory: (port: CreateArticlePort) => new CreateArticleService(port),
        deps: [CreateArticlePort],
      },
    ];
  }
}
