import { Observable } from "rxjs";
import { GetCategoriesResponse } from "../models/get-categories-response.model";

export abstract class GetCategoriesPort {
  abstract getCategories(
    page?: number,
    pageSize?: number,
    filterName?: string,
  ): Observable<GetCategoriesResponse>;
}
