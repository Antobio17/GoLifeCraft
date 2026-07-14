import { Observable } from "rxjs";
import { GetRecipesPort } from "../../domain/ports/get-recipes.port";
import { GetRecipesResponse } from "../../domain/models/get-recipes-response.model";

export class GetRecipesService {
  constructor(private getRecipesPort: GetRecipesPort) {}

  getRecipes(
    page: number = 1,
    pageSize: number = 100,
    filterName?: string,
  ): Observable<GetRecipesResponse> {
    return this.getRecipesPort.getRecipes(page, pageSize, filterName);
  }
}
