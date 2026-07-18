import { Observable } from "rxjs";
import { GetArticlesResponse } from "../models/get-articles-response.model";

export interface GetArticlesFilters {
  name?: string;
  category?: string;
  brand?: string;
  store?: string;
}

export abstract class GetArticlesPort {
  abstract getArticles(
    page?: number,
    pageSize?: number,
    filters?: GetArticlesFilters,
  ): Observable<GetArticlesResponse>;
}
