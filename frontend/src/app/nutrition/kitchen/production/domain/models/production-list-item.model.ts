import { ProductionListAttributes } from "./production-list-attributes.model";

export interface ProductionListItem {
  id: string;
  type: string;
  attributes: ProductionListAttributes;
}
