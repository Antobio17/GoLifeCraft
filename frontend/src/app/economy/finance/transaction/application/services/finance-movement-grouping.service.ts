import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { FinanceMovementGroup } from "../../domain/models/finance-movement-group.model";
import { FinanceMovementGrouping } from "../../domain/models/finance-movement-grouping.model";
import { FinanceMovementRow } from "../../domain/models/finance-movement-row.model";
import { FinanceTransactionKind } from "../../domain/models/finance-transaction-kind.model";
import { FinanceCategoryCatalogService } from "./finance-category-catalog.service";
import { FinanceViewService } from "./finance-view.service";

const MODULE_PATH = "economy/finance/transaction";
const INCOME_KEY = "income";

@Injectable()
export class FinanceMovementGroupingService {
  private translationService = inject(TranslationService);
  private view = inject(FinanceViewService);
  private categoryCatalog = inject(FinanceCategoryCatalogService);

  group(
    rows: FinanceMovementRow[],
    grouping: FinanceMovementGrouping,
  ): FinanceMovementGroup[] {
    if (grouping === FinanceMovementGrouping.CATEGORY) {
      return this.byCategory(rows);
    }

    return [
      {
        key: FinanceMovementGrouping.DATE,
        label: "",
        summaryLabel: "",
        rows,
      },
    ];
  }

  private byCategory(rows: FinanceMovementRow[]): FinanceMovementGroup[] {
    const buckets = new Map<string, FinanceMovementRow[]>();

    rows.forEach((row) => {
      const key = this.keyOf(row);

      buckets.set(key, [...(buckets.get(key) ?? []), row]);
    });

    return [...buckets.entries()]
      .map(([key, bucket]) => ({ key, bucket, total: this.totalOf(bucket) }))
      .sort((left, right) => right.total - left.total)
      .map((entry) => this.toGroup(entry.key, entry.bucket, entry.total));
  }

  private toGroup(
    key: string,
    rows: FinanceMovementRow[],
    total: number,
  ): FinanceMovementGroup {
    const [first] = rows;
    const totalLabel = first.income
      ? `+${this.view.sensitiveMoney(total)}`
      : `−${this.view.money(total)}`;

    return {
      key,
      label: `${first.emoji} ${this.labelOf(first)}`,
      summaryLabel: `${totalLabel} · ${this.countLabel(rows.length)}`,
      rows,
    };
  }

  private labelOf(row: FinanceMovementRow): string {
    if (row.income) return this.t("getEconomy.kind.income");

    return this.categoryCatalog.label(row.transaction.category);
  }

  private countLabel(count: number): string {
    const unit = this.t(
      count === 1 ? "getEconomy.movements.one" : "getEconomy.movements.many",
    );

    return `${count} ${unit}`;
  }

  private keyOf(row: FinanceMovementRow): string {
    if (row.transaction.kind === FinanceTransactionKind.INCOME) {
      return INCOME_KEY;
    }

    return row.transaction.category;
  }

  private totalOf(rows: FinanceMovementRow[]): number {
    return rows.reduce((total, row) => total + row.transaction.amount, 0);
  }

  private t(key: string): string {
    return this.translationService.translate(key, MODULE_PATH);
  }
}
