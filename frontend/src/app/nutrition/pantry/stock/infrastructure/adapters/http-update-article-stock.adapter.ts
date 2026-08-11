import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateArticleStockPort } from "../../domain/ports/update-article-stock.port";

@Injectable()
export class HttpUpdateArticleStockAdapter extends UpdateArticleStockPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/stock";

  updateArticleStock(articleId: string, quantity: number): Observable<void> {
    return this.http.put<void>(this.apiUrl + "/" + articleId, { quantity });
  }
}
