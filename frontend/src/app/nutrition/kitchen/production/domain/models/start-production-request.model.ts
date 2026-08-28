import { StartProductionItem } from "./start-production-item.model";

export interface StartProductionRequest {
  fromDate: string;
  toDate: string;
  items: StartProductionItem[];
}
