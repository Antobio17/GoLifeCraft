import { Observable } from "rxjs";
import { UpdateCategoryRequest } from "../models/update-category.model";

export abstract class UpdateCategoryPort {
  abstract updateCategory(
    id: string,
    request: UpdateCategoryRequest,
  ): Observable<void>;
}
