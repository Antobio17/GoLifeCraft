import { Observable } from "rxjs";
import {
  GetArticlesFilters,
  GetArticlesPort,
} from "../../domain/ports/get-articles.port";
import { GetArticlesResponse } from "../../domain/models/get-articles-response.model";

export class GetArticlesService {
  constructor(private getArticlesPort: GetArticlesPort) {}

  getArticles(
    page: number = 1,
    pageSize: number = 20,
    filters: GetArticlesFilters = {},
  ): Observable<GetArticlesResponse> {
    return this.getArticlesPort.getArticles(page, pageSize, filters);
  }
}
