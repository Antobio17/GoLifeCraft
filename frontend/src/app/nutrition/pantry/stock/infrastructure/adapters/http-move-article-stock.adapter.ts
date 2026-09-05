import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { MoveArticleStockPort } from "../../domain/ports/move-article-stock.port";
import { MoveArticleStockRequest } from "../../domain/models/move-article-stock-request.model";

@Injectable()
export class HttpMoveArticleStockAdapter extends MoveArticleStockPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/stock";

  moveArticleStock(
    articleId: string,
    request: MoveArticleStockRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${articleId}/location`, request);
  }
}
