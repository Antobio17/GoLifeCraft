import { Observable } from "rxjs";
import { ImportGlobalArticlePort } from "../../domain/ports/import-global-article.port";

export class ImportGlobalArticleService {
  constructor(private importGlobalArticlePort: ImportGlobalArticlePort) {}

  importGlobalArticle(globalArticleId: string): Observable<void> {
    return this.importGlobalArticlePort.importGlobalArticle(globalArticleId);
  }
}
