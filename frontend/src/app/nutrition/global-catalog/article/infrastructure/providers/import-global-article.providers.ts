import { Provider } from "@angular/core";
import { ImportGlobalArticlePort } from "@nutrition/global-catalog/article/domain/ports/import-global-article.port";
import { HttpImportGlobalArticleAdapter } from "@nutrition/global-catalog/article/infrastructure/adapters/http-import-global-article.adapter";
import { ImportGlobalArticleService } from "@nutrition/global-catalog/article/application/services/import-global-article.service";

export class ImportGlobalArticleProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: ImportGlobalArticlePort,
        useClass: HttpImportGlobalArticleAdapter,
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
