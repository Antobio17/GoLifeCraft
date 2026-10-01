import { Observable } from "rxjs";
import { ChangeArticleFavoritePort } from "../../domain/ports/change-article-favorite.port";

export class ChangeArticleFavoriteService {
  constructor(private changeArticleFavoritePort: ChangeArticleFavoritePort) {}

  changeArticleFavorite(id: string, favorite: boolean): Observable<void> {
    return this.changeArticleFavoritePort.changeArticleFavorite(id, favorite);
  }
}
