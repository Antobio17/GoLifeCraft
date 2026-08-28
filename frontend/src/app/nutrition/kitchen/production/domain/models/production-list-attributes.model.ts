import { ProductionStatus } from "./production-status.model";

export interface ProductionListAttributes {
  fromDate: string;
  toDate: string;
  status: ProductionStatus;
  itemCount: number;
  cookedCount: number;
  servingsPlanned: number;
  servingsCooked: number;
  emojis: string[];
}
