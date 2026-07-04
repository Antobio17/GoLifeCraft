import { Category } from "./category.model";
import { GetCategoriesMeta } from "./get-categories-meta.model";

export interface GetCategoriesResponse {
  meta: GetCategoriesMeta;
  data: Category[];
}
