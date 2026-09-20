export interface ArticleStockContext {
  hasPack: boolean;
  packSize: number;
  packUnit: string;
  baseUnit: string;
  pricePerPack: number | null;
}
