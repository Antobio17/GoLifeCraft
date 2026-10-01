import { Observable } from "rxjs";

export abstract class ChangeArticleFavoritePort {
  abstract changeArticleFavorite(
    id: string,
    favorite: boolean,
  ): Observable<void>;
}
