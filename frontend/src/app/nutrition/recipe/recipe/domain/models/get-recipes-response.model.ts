import { RecipeListItem } from "./recipe.model";

export interface GetRecipesMeta {
  pageNumber: number;
  pageSize: number;
  total: number;
}

export interface GetRecipesResponse {
  meta: GetRecipesMeta;
  data: RecipeListItem[];
}
