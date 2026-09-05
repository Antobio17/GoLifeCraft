import { GetPantryLocationsMeta } from "./get-pantry-locations-meta.model";
import { PantryLocationItem } from "./pantry-location-item.model";

export interface GetPantryLocationItemsResponse {
  meta: GetPantryLocationsMeta;
  data: PantryLocationItem[];
}
