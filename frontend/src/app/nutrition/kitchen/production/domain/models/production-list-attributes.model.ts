import { ProductionStatus } from "./production-status.model";
import { ProductionThumbnail } from "./production-thumbnail.model";

export interface ProductionListAttributes {
  fromDate: string;
  toDate: string;
  status: ProductionStatus;
  itemCount: number;
  cookedCount: number;
  servingsPlanned: number;
  servingsCooked: number;
  thumbnails: ProductionThumbnail[];
}
