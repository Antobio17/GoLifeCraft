import { ArticleStockContext } from "./article-stock-context.model";
import { ChipTone } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { StockLevel } from "./stock-level.model";
import { StockTrackingMode } from "./stock-tracking-mode.model";

export interface ArticleStockView extends ArticleStockContext {
  stock: number;
  packs: number;
  packsText: string;
  baseText: string;
  valueText: string | null;
  mainText: string;
  subText: string;
  trackingMode: StockTrackingMode;
  tracked: boolean;
  estimated: boolean;
  level: StockLevel;
  levelTone: ChipTone;
  confidence: number;
  confidencePercent: number;
  bandText: string | null;
  referenceQuantity: number | null;
}
