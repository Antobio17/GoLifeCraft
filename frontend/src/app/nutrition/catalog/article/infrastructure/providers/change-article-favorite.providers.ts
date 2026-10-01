import { Provider } from "@angular/core";
import { ChangeArticleFavoritePort } from "@nutrition/catalog/article/domain/ports/change-article-favorite.port";
import { HttpChangeArticleFavoriteAdapter } from "@nutrition/catalog/article/infrastructure/adapters/http-change-article-favorite.adapter";
import { ChangeArticleFavoriteService } from "@nutrition/catalog/article/application/services/change-article-favorite.service";

export class ChangeArticleFavoriteProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: ChangeArticleFavoritePort,
        useClass: HttpChangeArticleFavoriteAdapter,
      },
      {
        provide: ChangeArticleFavoriteService,
        useFactory: (port: ChangeArticleFavoritePort) =>
          new ChangeArticleFavoriteService(port),
        deps: [ChangeArticleFavoritePort],
      },
    ];
  }
}
