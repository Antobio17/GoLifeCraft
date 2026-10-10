import { ProductionListRow } from "./production-list-row.model";

export interface ProductionListGroup {
  key: string;
  title: string;
  count: string;
  rows: ProductionListRow[];
}
