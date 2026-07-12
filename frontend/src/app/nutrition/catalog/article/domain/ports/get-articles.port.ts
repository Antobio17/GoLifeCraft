import { Observable } from "rxjs";
import { GetArticlesResponse } from "../models/get-articles-response.model";

export abstract class GetArticlesPort {
  abstract getArticles(
    page?: number,
    pageSize?: number,
    filterName?: string,
  ): Observable<GetArticlesResponse>;
}
