import { Observable } from "rxjs";
import { GetCategoriesPort } from "../../domain/ports/get-categories.port";
import { GetCategoriesResponse } from "../../domain/models/get-categories-response.model";

export class GetCategoriesService {
  constructor(private getCategoriesPort: GetCategoriesPort) {}

  getCategories(
    page: number = 1,
    pageSize: number = 10,
    filterName?: string,
  ): Observable<GetCategoriesResponse> {
    return this.getCategoriesPort.getCategories(page, pageSize, filterName);
  }
}
