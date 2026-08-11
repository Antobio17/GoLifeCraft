import { Injectable, inject } from "@angular/core";
import { ArticleStockContext } from "@nutrition/catalog/article/domain/models/article-stock-context.model";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import { ArticleStockView } from "../../domain/models/article-stock-view.model";

@Injectable()
export class StockViewService {
  private unitCatalog = inject(UnitCatalogService);

  build(context: ArticleStockContext, stock: number): ArticleStockView {
    const packs = context.packSize > 0 ? stock / context.packSize : 0;

    return {
      ...context,
      stock,
      packs,
      packsText: `${this.number(packs, 2)} ${this.unitCatalog.pluralLabel(context.packUnit, packs)}`,
      baseText: `${this.number(stock)} ${context.baseUnit}`,
      valueText: this.valueText(context, stock),
    };
  }

  packLabel(context: ArticleStockContext): string {
    return this.unitCatalog.pluralLabel(context.packUnit, 2);
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
