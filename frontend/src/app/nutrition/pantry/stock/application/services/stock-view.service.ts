import { Injectable, inject } from "@angular/core";
import { ArticleStockContext } from "../../domain/models/article-stock-context.model";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import { ChipTone } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { ArticleStockView } from "../../domain/models/article-stock-view.model";
import { ArticleStockEstimate } from "../../domain/models/article-stock-estimate.model";
import { StockLevel } from "../../domain/models/stock-level.model";
import { StockTrackingMode } from "../../domain/models/stock-tracking-mode.model";

const LEVEL_TONES: Record<StockLevel, ChipTone> = {
  [StockLevel.Unknown]: "neutral",
  [StockLevel.Empty]: "danger",
  [StockLevel.Low]: "warning",
  [StockLevel.Medium]: "accent",
  [StockLevel.High]: "brand",
  [StockLevel.Full]: "brand-solid",
};

@Injectable()
export class StockViewService {
  private unitCatalog = inject(UnitCatalogService);

  build(
    context: ArticleStockContext,
    estimate: ArticleStockEstimate,
  ): ArticleStockView {
    const stock = estimate.quantity;
    const estimated = StockTrackingMode.Approximate === estimate.trackingMode;
    const bandText = estimated ? this.bandText(context, estimate) : null;
    const packsText = this.packsTextOf(context, stock);
    const baseText = this.amountText(context, stock);

    return {
      ...context,
      stock,
      packs: context.packSize > 0 ? stock / context.packSize : 0,
      valueText: this.valueText(context, stock),
      mainText: context.hasPack ? packsText : baseText,
      subText: context.hasPack ? baseText : (bandText ?? ""),
      bandText: context.hasPack ? bandText : null,
      trackingMode: estimate.trackingMode,
      level: estimate.level,
      levelTone: LEVEL_TONES[estimate.level],
      confidencePercent: estimated
        ? Math.round(estimate.confidence * 100)
        : null,
    };
  }

  packLabel(context: ArticleStockContext): string {
    return this.unitCatalog.pluralLabel(context.packUnit, 2);
  }

  amountText(context: ArticleStockContext, quantity: number): string {
    return `${this.number(quantity)} ${context.baseUnit}`;
  }

  packsTextOf(context: ArticleStockContext, quantity: number): string {
    const packs = context.packSize > 0 ? quantity / context.packSize : 0;

    return `${this.number(packs, 2)} ${this.unitCatalog.pluralLabel(context.packUnit, packs)}`;
  }

  private bandText(
    context: ArticleStockContext,
    estimate: ArticleStockEstimate,
  ): string | null {
    if (null === estimate.minQuantity || null === estimate.maxQuantity)
      return null;

    if (estimate.minQuantity === estimate.maxQuantity) return null;

    return `${this.number(estimate.minQuantity)} – ${this.number(estimate.maxQuantity)} ${context.baseUnit}`;
  }

  private valueText(
    context: ArticleStockContext,
    stock: number,
  ): string | null {
    if (null === context.pricePerPack || context.packSize <= 0) return null;

    return `${this.number((context.pricePerPack / context.packSize) * stock, 2)} €`;
  }

  private number(value: number, decimals = 1): string {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}
