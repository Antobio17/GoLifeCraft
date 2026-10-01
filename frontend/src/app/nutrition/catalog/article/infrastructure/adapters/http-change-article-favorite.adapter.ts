import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ChangeArticleFavoritePort } from "../../domain/ports/change-article-favorite.port";

@Injectable()
export class HttpChangeArticleFavoriteAdapter extends ChangeArticleFavoritePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/catalog/article";

  changeArticleFavorite(id: string, favorite: boolean): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/favorite`, { favorite });
  }
}
