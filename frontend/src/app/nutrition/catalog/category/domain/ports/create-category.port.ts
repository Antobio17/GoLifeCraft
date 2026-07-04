import { Observable } from "rxjs";
import { CreateCategoryRequest } from "../models/create-category.model";

export abstract class CreateCategoryPort {
  abstract createCategory(request: CreateCategoryRequest): Observable<void>;
}
