import { SupermarketAisle } from "./supermarket-aisle.model";

export interface SupermarketAttributes {
  name: string;
  aisles?: SupermarketAisle[];
}
