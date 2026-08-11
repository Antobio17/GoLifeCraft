import { Observable } from "rxjs";

export abstract class UpdateArticleStockPort {
  abstract updateArticleStock(
    articleId: string,
    quantity: number,
  ): Observable<void>;
}
