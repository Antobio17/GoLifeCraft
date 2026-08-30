import { Injectable, inject } from "@angular/core";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import { KitchenFormatService } from "./kitchen-format.service";
import { ProductionLot } from "../../domain/models/production-lot.model";
import { ProductionLotRow } from "../../domain/models/production-lot-row.model";
import { ProductionLotLabels } from "../../domain/models/production-lot-labels.model";
import { ProductionSubRecipe } from "../../domain/models/production-sub-recipe.model";

@Injectable()
export class ProductionViewService {
  private unitCatalog = inject(UnitCatalogService);
  private format = inject(KitchenFormatService);

  quantityLabel(quantity: number, unit: string): string {
    if (!this.unitCatalog.keys().includes(unit)) {
      return this.unitCatalog.amountLabel(quantity, unit);
    }

    return `${this.format.decimal(quantity)} ${this.unitCatalog.pluralLabel(unit, quantity)}`;
  }

  scale(quantity: number, from: number, to: number): number {
    if (from <= 0) return quantity;

    return Math.round(((quantity / from) * to + Number.EPSILON) * 100) / 100;
  }

  joinNames(names: string[]): string {
    return new Intl.ListFormat(this.format.locale(), {
      style: "long",
      type: "conjunction",
    }).format(names);
  }

  progressLabel(checked: number, total: number): string {
    return `${checked} / ${total}`;
  }

  lotLabel(subRecipe: ProductionSubRecipe, fallback: string): string {
    if (null === subRecipe.sourceProductionItemId) return fallback;

    const code = subRecipe.lotCode ?? "";

    return "" === subRecipe.lotLabel ? code : `${code} · ${subRecipe.lotLabel}`;
  }

  lotRows(
    lots: ProductionLot[],
    selectedId: string | null,
    labels: ProductionLotLabels,
  ): ProductionLotRow[] {
    return lots.map((lot) => ({
      productionItemId: lot.id,
      title: this.lotTitle(lot, labels.untitled),
      description: this.lotDescription(lot, labels),
      selected: lot.id === selectedId,
    }));
  }

  private lotTitle(lot: ProductionLot, untitled: string): string {
    const code = lot.attributes.code ?? untitled;

    return "" === lot.attributes.label
      ? code
      : `${code} · ${lot.attributes.label}`;
  }

  private lotDescription(
    lot: ProductionLot,
    labels: ProductionLotLabels,
  ): string {
    const left = lot.attributes.servingsLeft;
    const servings = left > 0 ? labels.left(this.servings(left)) : labels.gone;

    if (!lot.attributes.customized) {
      return `${lot.attributes.cookedOn} · ${servings}`;
    }

    return `${lot.attributes.cookedOn} · ${servings} · ${labels.changed}`;
  }

  servings(value: number): string {
    return this.format.decimal(value);
  }

  toggle(keys: ReadonlySet<string>, key: string): ReadonlySet<string> {
    const next = new Set(keys);
    if (next.has(key)) {
      next.delete(key);

      return next;
    }

    next.add(key);

    return next;
  }
}
