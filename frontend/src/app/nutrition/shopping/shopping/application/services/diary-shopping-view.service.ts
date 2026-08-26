import { Injectable, inject } from "@angular/core";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import { DiaryShoppingNeed } from "@nutrition/diary/diary/domain/models/diary-shopping-need.model";
import { DiaryShoppingLabels } from "@nutrition/shopping/shopping/domain/models/diary-shopping-labels.model";
import { DiaryShoppingRow } from "@nutrition/shopping/shopping/domain/models/diary-shopping-row.model";
import { ShoppingListViewService } from "@nutrition/shopping/shopping/application/services/shopping-list-view.service";

@Injectable()
export class DiaryShoppingViewService {
  private unitCatalog = inject(UnitCatalogService);
  private shoppingView = inject(ShoppingListViewService);

  todayIso(): string {
    return this.toIso(new Date());
  }

  addDays(iso: string, days: number): string {
    const date = this.parse(iso);
    date.setDate(date.getDate() + days);

    return this.toIso(date);
  }

  defaultQuantities(needs: DiaryShoppingNeed[]): Record<string, number> {
    return needs.reduce<Record<string, number>>((quantities, need) => {
      quantities[need.articleId] = Math.max(1, need.packs);

      return quantities;
    }, {});
  }

  coveredArticleIds(needs: DiaryShoppingNeed[]): string[] {
    return needs
      .filter((need) => need.missingQuantity <= 0)
      .map((need) => need.articleId);
  }

  baseQuantity(need: DiaryShoppingNeed): number {
    return this.round(
      need.missingQuantity > 0 ? need.missingQuantity : need.quantity,
    );
  }

  rows(
    needs: DiaryShoppingNeed[],
    unchecked: string[],
    quantities: Record<string, number>,
    labels: DiaryShoppingLabels,
  ): DiaryShoppingRow[] {
    return needs.map((need) => {
      const quantity = quantities[need.articleId] ?? Math.max(1, need.packs);

      return {
        articleId: need.articleId,
        name: need.name,
        emoji: need.emoji,
        brand: need.brand,
        store: need.store,
        priceLabel: this.shoppingView.money((need.price ?? 0) * quantity),
        packLabel: this.packLabel(need, quantity, labels),
        quantity,
        baseQuantity: this.baseQuantity(need),
        covered: need.missingQuantity <= 0,
        checked: !unchecked.includes(need.articleId),
      };
    });
  }

  private unitBase(need: DiaryShoppingNeed): number {
    if (need.packSize && need.packSize > 0) return need.packSize;

    return need.missingQuantity > 0 ? need.missingQuantity : need.quantity;
  }

  private packLabel(
    need: DiaryShoppingNeed,
    quantity: number,
    labels: DiaryShoppingLabels,
  ): string | null {
    const parts = [
      ...this.packSizeParts(need, labels),
      labels.need.replace("{amount}", this.amount(need.quantity, need)),
      ...this.stockParts(need, labels),
      ...this.leftoverParts(need, quantity, labels),
      ...(need.inShoppingList ? [labels.inList] : []),
    ];

    return parts.join(" · ");
  }

  private packSizeParts(
    need: DiaryShoppingNeed,
    labels: DiaryShoppingLabels,
  ): string[] {
    if (!need.packUnit || !need.packSize) return [];

    return [
      labels.perPack
        .replace("{amount}", this.amount(need.packSize, need))
        .replace("{unit}", this.unitCatalog.label(need.packUnit)),
    ];
  }

  private stockParts(
    need: DiaryShoppingNeed,
    labels: DiaryShoppingLabels,
  ): string[] {
    if (need.stockQuantity <= 0) return [];

    const stock = labels.stock.replace(
      "{amount}",
      this.amount(need.stockQuantity, need),
    );

    if (need.missingQuantity <= 0) return [stock, labels.covered];

    return [
      stock,
      labels.missing.replace(
        "{amount}",
        this.amount(need.missingQuantity, need),
      ),
    ];
  }

  private leftoverParts(
    need: DiaryShoppingNeed,
    quantity: number,
    labels: DiaryShoppingLabels,
  ): string[] {
    const leftover = this.round(
      quantity * this.unitBase(need) - need.missingQuantity,
    );
    if (leftover <= 0) return [];

    return [labels.leftover.replace("{amount}", this.amount(leftover, need))];
  }

  private amount(value: number, need: DiaryShoppingNeed): string {
    return this.unitCatalog.amountLabel(value, need.baseUnit);
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private parse(iso: string): Date {
    const [year, month, day] = iso.split("-").map(Number);

    return new Date(year, month - 1, day);
  }

  private toIso(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
  }
}
