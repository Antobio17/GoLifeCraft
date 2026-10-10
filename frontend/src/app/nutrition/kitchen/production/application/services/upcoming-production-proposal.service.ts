import { Injectable, inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { GetProductionProposalService } from "./get-production-proposal.service";
import { ProductionRangeService } from "./production-range.service";
import { ProductionDateRange } from "../../domain/models/production-date-range.model";
import { ProposalAttributes } from "../../domain/models/proposal-attributes.model";
import { ProposalToCook } from "../../domain/models/proposal-to-cook.model";
import { ProposalDay } from "../../domain/models/proposal-day.model";
import { ProposalDayStatus } from "../../domain/models/proposal-day-status.enum";
import { WeekStripDay } from "@shared/design-system/week-strip/domain/models/week-strip-day.model";
import { WeekStripDayTone } from "@shared/design-system/week-strip/domain/models/week-strip-day-tone.enum";

@Injectable()
export class UpcomingProductionProposalService {
  private getProductionProposalService = inject(GetProductionProposalService);
  private range = inject(ProductionRangeService);

  private readonly upcomingDays = 6;
  private readonly previewSize = 3;

  upcomingRange(): ProductionDateRange {
    return this.rangeAhead(this.upcomingDays);
  }

  getUpcoming(): Observable<ProposalAttributes | null> {
    return this.fetch(this.upcomingRange());
  }

  weekDays(
    week: ProposalAttributes | null,
    statusLabels: Record<ProposalDayStatus, string>,
  ): WeekStripDay[] {
    const byDate = new Map(
      (week?.coverage ?? []).map((day) => [day.date, day]),
    );

    return this.range.stripDays(this.range.todayIso()).map((day) => {
      const coverage = byDate.get(day.date);

      if (!coverage) {
        return day;
      }

      return {
        ...day,
        tone: this.tone(coverage),
        ariaLabel: `${day.ariaLabel} · ${statusLabels[coverage.status]}`,
      };
    });
  }

  countDays(
    week: ProposalAttributes | null,
    status: ProposalDayStatus,
  ): number {
    return (week?.coverage ?? []).filter((day) => status === day.status).length;
  }

  private fetch(
    range: ProductionDateRange,
  ): Observable<ProposalAttributes | null> {
    return this.getProductionProposalService
      .getProductionProposal(range.fromDate, range.toDate)
      .pipe(
        map((response) => response.data.attributes),
        catchError(() => of(null)),
      );
  }

  totalDeficit(proposal: ProposalAttributes): number {
    return proposal.toCook.reduce((total, item) => total + item.deficit, 0);
  }

  preview(proposal: ProposalAttributes): ProposalToCook[] {
    return [...proposal.toCook]
      .sort((first, second) => second.deficit - first.deficit)
      .slice(0, this.previewSize);
  }

  hiddenCount(proposal: ProposalAttributes): number {
    return Math.max(0, proposal.toCook.length - this.previewSize);
  }

  private tone(day: ProposalDay): WeekStripDayTone | undefined {
    if (ProposalDayStatus.ToCook === day.status) {
      return WeekStripDayTone.Warning;
    }

    if (ProposalDayStatus.Covered === day.status) {
      return WeekStripDayTone.Success;
    }

    return undefined;
  }

  private rangeAhead(days: number): ProductionDateRange {
    const fromDate = this.range.todayIso();

    return { fromDate, toDate: this.range.addDays(fromDate, days) };
  }
}
