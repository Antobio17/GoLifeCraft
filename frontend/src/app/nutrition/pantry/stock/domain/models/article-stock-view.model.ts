import { ArticleStockContext } from "@nutrition/catalog/article/domain/models/article-stock-context.model";

export interface ArticleStockView extends ArticleStockContext {
  stock: number;
  packs: number;
  packsText: string;
  baseText: string;
  valueText: string | null;
}
