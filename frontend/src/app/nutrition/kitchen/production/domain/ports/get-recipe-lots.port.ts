import { Observable } from "rxjs";
import { GetRecipeLotsResponse } from "../models/get-recipe-lots-response.model";

export abstract class GetRecipeLotsPort {
  abstract getRecipeLots(recipeId: string): Observable<GetRecipeLotsResponse>;
}
