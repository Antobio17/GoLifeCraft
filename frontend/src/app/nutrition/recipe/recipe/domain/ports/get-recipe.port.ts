import { Observable } from "rxjs";
import { GetRecipeResponse } from "../models/get-recipe-response.model";

export abstract class GetRecipePort {
  abstract getRecipe(id: string): Observable<GetRecipeResponse>;
}
