import { Provider } from "@angular/core";
import { DeleteArticlePort } from "@nutrition/catalog/article/domain/ports/delete-article.port";
import { HttpDeleteArticleAdapter } from "@nutrition/catalog/article/infrastructure/adapters/http-delete-article.adapter";
import { DeleteArticleService } from "@nutrition/catalog/article/application/services/delete-article.service";

export class DeleteArticleProviders {
  static getProviders(): Provider[] {
    return [
      { provide: DeleteArticlePort, useClass: HttpDeleteArticleAdapter },
      {
        provide: DeleteArticleService,
        useFactory: (port: DeleteArticlePort) => new DeleteArticleService(port),
        deps: [DeleteArticlePort],
      },
    ];
  }
}
