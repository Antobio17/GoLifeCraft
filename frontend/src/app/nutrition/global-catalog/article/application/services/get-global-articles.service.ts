import { Observable } from "rxjs";
import { GetGlobalArticlesPort } from "../../domain/ports/get-global-articles.port";
import { GetGlobalArticlesResponse } from "../../domain/models/get-global-articles-response.model";

export class GetGlobalArticlesService {
  constructor(private getGlobalArticlesPort: GetGlobalArticlesPort) {}

  getGlobalArticles(
    page: number = 1,
    pageSize: number = 100,
    filterName?: string,
    filterSource?: string,
  ): Observable<GetGlobalArticlesResponse> {
    return this.getGlobalArticlesPort.getGlobalArticles(
      page,
      pageSize,
      filterName,
      filterSource,
    );
  }
}
