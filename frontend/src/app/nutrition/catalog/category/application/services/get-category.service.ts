import { Observable } from "rxjs";
import { GetCategoryPort } from "../../domain/ports/get-category.port";
import { GetCategoryResponse } from "../../domain/models/get-category-response.model";

export class GetCategoryService {
  constructor(private getCategoryPort: GetCategoryPort) {}

  getCategory(id: string): Observable<GetCategoryResponse> {
    return this.getCategoryPort.getCategory(id);
  }
}
