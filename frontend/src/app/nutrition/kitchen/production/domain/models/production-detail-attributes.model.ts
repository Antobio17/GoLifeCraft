import { ProductionItemView } from "./production-item-view.model";
import { ProductionStatus } from "./production-status.model";

export interface ProductionDetailAttributes {
  fromDate: string;
  toDate: string;
  status: ProductionStatus;
  items: ProductionItemView[];
  servingsPlanned: number;
  servingsCooked: number;
}
