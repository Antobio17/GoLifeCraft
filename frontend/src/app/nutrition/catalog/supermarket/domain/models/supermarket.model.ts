import { SupermarketAttributes } from "./supermarket-attributes.model";

export interface Supermarket {
  id: string;
  type: string;
  attributes: SupermarketAttributes;
}
