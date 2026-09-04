import { ProductionListItem } from "./production-list-item.model";

export interface ProductionListRow {
  production: ProductionListItem;
  title: string;
  meta: string;
  statusLabel: string;
  cooking: boolean;
  emoji: string;
  imageUrl: string | null;
}
