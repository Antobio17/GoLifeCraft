import { Observable } from "rxjs";
import { GetGlobalArticlesResponse } from "../models/get-global-articles-response.model";
import { GetGlobalArticlesFilters } from "../models/get-global-articles-filters.model";

export abstract class GetGlobalArticlesPort {
  abstract getGlobalArticles(
    page: number,
    pageSize: number,
    filters: GetGlobalArticlesFilters,
  ): Observable<GetGlobalArticlesResponse>;
}
