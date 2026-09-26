import { StockLevel } from "./stock-level.model";
import { StockTrackingMode } from "./stock-tracking-mode.model";

export interface ArticleStockEstimate {
  quantity: number;
  trackingMode: StockTrackingMode;
  confidence: number;
  minQuantity: number | null;
  maxQuantity: number | null;
  level: StockLevel;
}
