import { Provider } from "@angular/core";
import { GetArticleDraftPort } from "@nutrition/catalog/article/domain/ports/get-article-draft.port";
import { HttpGetArticleDraftAdapter } from "@nutrition/catalog/article/infrastructure/adapters/http-get-article-draft.adapter";
import { GetArticleDraftService } from "@nutrition/catalog/article/application/services/get-article-draft.service";

export class GetArticleDraftProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetArticleDraftPort, useClass: HttpGetArticleDraftAdapter },
      {
        provide: GetArticleDraftService,
        useFactory: (port: GetArticleDraftPort) =>
          new GetArticleDraftService(port),
        deps: [GetArticleDraftPort],
      },
    ];
  }
}
