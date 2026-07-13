import { Observable } from "rxjs";

export abstract class DeleteArticlePort {
  abstract deleteArticle(id: string): Observable<void>;
}
