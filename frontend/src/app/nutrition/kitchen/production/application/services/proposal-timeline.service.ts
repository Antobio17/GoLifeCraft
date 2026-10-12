import { Injectable, inject } from "@angular/core";
import { BarChartBar } from "@shared/design-system/bar-chart/domain/models/bar-chart-bar.model";
import { KitchenFormatService } from "./kitchen-format.service";
import { ProductionRangeService } from "./production-range.service";
import { ProposalRow } from "../../domain/models/proposal-row.model";
import { ProposalToCook } from "../../domain/models/proposal-to-cook.model";

const WEEKDAY_LABEL_MAX_DAYS = 7;

@Injectable()
export class ProposalTimelineService {
  private range = inject(ProductionRangeService);
  private format = inject(KitchenFormatService);

  dueDays(rows: ProposalRow[]): string[] {
    return [
      ...new Set(
        rows
          .map((row) => row.item.dueDate)
          .filter((day): day is string => null !== day),
      ),
    ].sort();
  }

  bars(rows: ProposalRow[], fromDate: string, toDate: string): BarChartBar[] {
    const days = Math.max(1, this.range.dayCount(fromDate, toDate));
    const weekdays = days <= WEEKDAY_LABEL_MAX_DAYS;

    return Array.from({ length: days }, (_, index) =>
      this.range.addDays(fromDate, index),
    ).map((date) => {
      const value = this.servingsOn(rows, date, fromDate);

      return {
        label: weekdays
          ? this.range.weekday(date, "short")
          : this.range.dayOfMonth(date),
        value,
        valueLabel: this.format.decimal(value),
        selected: date === fromDate,
      };
    });
  }

  selectedServings(rows: ProposalRow[]): number {
    const total = rows
      .filter((row) => row.selected)
      .reduce((sum, row) => sum + row.servings, 0);

    return Math.round(total * 100) / 100;
  }

  packPending(item: ProposalToCook, servings: number): boolean {
    if (!item.packHint) return false;

    return servings < item.packHint.suggestedServings;
  }

  private servingsOn(
    rows: ProposalRow[],
    date: string,
    fromDate: string,
  ): number {
    return this.selectedServings(
      rows.filter((row) => (row.item.dueDate ?? fromDate) === date),
    );
  }
}
