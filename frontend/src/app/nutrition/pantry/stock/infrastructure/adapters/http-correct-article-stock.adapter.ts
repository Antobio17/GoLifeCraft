import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CorrectArticleStockPort } from "../../domain/ports/correct-article-stock.port";
import { CorrectArticleStockRequest } from "../../domain/models/correct-article-stock-request.model";

@Injectable()
export class HttpCorrectArticleStockAdapter extends CorrectArticleStockPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/stock";

  correctArticleStock(
    articleId: string,
    request: CorrectArticleStockRequest,
  ): Observable<void> {
    return this.http.put<void>(this.apiUrl + "/" + articleId, request);
  }
}
