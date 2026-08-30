import { Observable } from "rxjs";
import { GetRecipeLotsPort } from "../../domain/ports/get-recipe-lots.port";
import { GetRecipeLotsResponse } from "../../domain/models/get-recipe-lots-response.model";

export class GetRecipeLotsService {
  constructor(private getRecipeLotsPort: GetRecipeLotsPort) {}

  getRecipeLots(recipeId: string): Observable<GetRecipeLotsResponse> {
    return this.getRecipeLotsPort.getRecipeLots(recipeId);
  }
}
