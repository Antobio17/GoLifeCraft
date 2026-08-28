import { ProductionDetailAttributes } from "./production-detail-attributes.model";

export interface ProductionDetail {
  id: string;
  type: string;
  attributes: ProductionDetailAttributes;
}
