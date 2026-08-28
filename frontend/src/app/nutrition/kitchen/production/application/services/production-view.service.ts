import { Injectable, inject } from "@angular/core";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import { KitchenFormatService } from "./kitchen-format.service";

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

  /**
   * Reads the list the way you would say it out loud, because a sub-recipe can feed more than one
   * parent in the same batch.
   */
  joinNames(names: string[]): string {
    if (names.length < 2) return names[0] ?? "";

    return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
  }

  progressLabel(checked: number, total: number): string {
    return `${checked} / ${total}`;
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
