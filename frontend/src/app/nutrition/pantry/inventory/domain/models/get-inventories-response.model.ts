import { GetInventoriesMeta } from "./get-inventories-meta.model";
import { Inventory } from "./inventory.model";

export interface GetInventoriesResponse {
  meta: GetInventoriesMeta;
  data: Inventory[];
}
