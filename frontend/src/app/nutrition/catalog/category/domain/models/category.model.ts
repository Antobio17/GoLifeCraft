import { CategoryAttributes } from "./category-attributes.model";

export interface Category {
  id: string;
  type: string;
  attributes: CategoryAttributes;
}
