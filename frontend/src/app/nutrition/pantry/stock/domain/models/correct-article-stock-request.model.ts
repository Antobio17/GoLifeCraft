import { StockCorrectionKind } from "./stock-correction-kind.model";
import { StockLevel } from "./stock-level.model";

export interface CorrectArticleStockRequest {
  kind: StockCorrectionKind;
  quantity?: number;
  unit?: string;
  level?: StockLevel;
}
