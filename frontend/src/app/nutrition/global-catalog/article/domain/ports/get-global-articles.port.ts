import { Observable } from "rxjs";
import { GetGlobalArticlesResponse } from "../models/get-global-articles-response.model";

export abstract class GetGlobalArticlesPort {
  abstract getGlobalArticles(
    page?: number,
    pageSize?: number,
    filterName?: string,
    filterSource?: string,
  ): Observable<GetGlobalArticlesResponse>;
}
