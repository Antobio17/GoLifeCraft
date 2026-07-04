import { Observable } from "rxjs";
import { CreateCategoryPort } from "../../domain/ports/create-category.port";
import { CreateCategoryRequest } from "../../domain/models/create-category.model";

export class CreateCategoryService {
  constructor(private createCategoryPort: CreateCategoryPort) {}

  createCategory(request: CreateCategoryRequest): Observable<void> {
    return this.createCategoryPort.createCategory(request);
  }
}
