import { ArticleStockContext } from "./article-stock-context.model";
import { ChipTone } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { StockLevel } from "./stock-level.model";
import { StockTrackingMode } from "./stock-tracking-mode.model";

export interface ArticleStockView extends ArticleStockContext {
  stock: number;
  packs: number;
  valueText: string | null;
  mainText: string;
  subText: string;
  bandText: string | null;
  trackingMode: StockTrackingMode;
  level: StockLevel;
  levelTone: ChipTone;
  confidencePercent: number | null;
}
