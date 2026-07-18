import { Observable } from "rxjs";

export abstract class ImportGlobalArticlePort {
  abstract importGlobalArticle(globalArticleId: string): Observable<void>;
}
