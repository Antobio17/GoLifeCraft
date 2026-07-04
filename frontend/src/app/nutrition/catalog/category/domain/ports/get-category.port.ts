import { Observable } from "rxjs";
import { GetCategoryResponse } from "../models/get-category-response.model";

export abstract class GetCategoryPort {
  abstract getCategory(id: string): Observable<GetCategoryResponse>;
}
