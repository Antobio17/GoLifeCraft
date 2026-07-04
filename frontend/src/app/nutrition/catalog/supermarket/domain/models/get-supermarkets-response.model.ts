import { Supermarket } from "./supermarket.model";
import { GetSupermarketsMeta } from "./get-supermarkets-meta.model";

export interface GetSupermarketsResponse {
  meta: GetSupermarketsMeta;
  data: Supermarket[];
}
