import { Observable } from "rxjs";
import { UpdateCategoryPort } from "../../domain/ports/update-category.port";
import { UpdateCategoryRequest } from "../../domain/models/update-category.model";

export class UpdateCategoryService {
  constructor(private updateCategoryPort: UpdateCategoryPort) {}

  updateCategory(id: string, request: UpdateCategoryRequest): Observable<void> {
    return this.updateCategoryPort.updateCategory(id, request);
  }
}
