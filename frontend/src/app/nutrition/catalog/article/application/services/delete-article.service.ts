import { Observable } from "rxjs";
import { DeleteArticlePort } from "../../domain/ports/delete-article.port";

export class DeleteArticleService {
  constructor(private deleteArticlePort: DeleteArticlePort) {}

  deleteArticle(id: string): Observable<void> {
    return this.deleteArticlePort.deleteArticle(id);
  }
}
