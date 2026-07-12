import { Observable } from "rxjs";
import { GetArticlesPort } from "../../domain/ports/get-articles.port";
import { GetArticlesResponse } from "../../domain/models/get-articles-response.model";

export class GetArticlesService {
  constructor(private getArticlesPort: GetArticlesPort) {}

  getArticles(
    page: number = 1,
    pageSize: number = 100,
    filterName?: string,
  ): Observable<GetArticlesResponse> {
    return this.getArticlesPort.getArticles(page, pageSize, filterName);
  }
}
