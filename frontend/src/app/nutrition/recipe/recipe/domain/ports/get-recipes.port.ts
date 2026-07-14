import { Observable } from "rxjs";
import { GetRecipesResponse } from "../models/get-recipes-response.model";

export abstract class GetRecipesPort {
  abstract getRecipes(
    page?: number,
    pageSize?: number,
    filterName?: string,
  ): Observable<GetRecipesResponse>;
}
