import { StockCorrectionKind } from "./stock-correction-kind.model";

export interface CorrectArticleStockRequest {
  kind: StockCorrectionKind;
  quantity: number;
}
