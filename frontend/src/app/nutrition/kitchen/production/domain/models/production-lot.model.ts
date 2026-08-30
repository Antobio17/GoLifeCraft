import { ProductionLotAttributes } from "./production-lot-attributes.model";

export interface ProductionLot {
  id: string;
  type: string;
  attributes: ProductionLotAttributes;
}
