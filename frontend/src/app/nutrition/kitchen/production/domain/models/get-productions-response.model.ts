import { ProductionListItem } from "./production-list-item.model";

export interface GetProductionsResponse {
  meta: { pageNumber: number; pageSize: number; total: number };
  data: ProductionListItem[];
}
