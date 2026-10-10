import { Injectable, inject } from "@angular/core";
import { WeekStripDay } from "@shared/design-system/week-strip/domain/models/week-strip-day.model";
import { WeekStripDayState } from "@shared/design-system/week-strip/domain/models/week-strip-day-state.enum";
import { WeekStripDayTone } from "@shared/design-system/week-strip/domain/models/week-strip-day-tone.enum";
import {
  DiaryCalendarDay,
  DiaryCalendarStatus,
} from "../../domain/models/diary-calendar.model";
import { DiaryWeekTally } from "../../domain/models/diary-week-tally.model";
import { DiaryCalendarViewService } from "./diary-calendar-view.service";
import { DiaryViewService } from "./diary-view.service";

const DAYS_IN_WEEK = 7;

const STATUS_TONES: Record<DiaryCalendarStatus, WeekStripDayTone | undefined> =
  {
    green: WeekStripDayTone.Success,
    orange: WeekStripDayTone.Warning,
    red: WeekStripDayTone.Danger,
    rest: undefined,
  };

@Injectable()
export class DiaryWeekViewService {
  private view = inject(DiaryViewService);
  private calendarView = inject(DiaryCalendarViewService);

  weekStart(iso: string): string {
    const [year, month, day] = iso.split("-").map((value) => Number(value));
    const weekday = (new Date(year, month - 1, day).getDay() + 6) % 7;

    return this.view.addDays(iso, -weekday);
  }

  rangeLabel(weekStart: string): string {
    const [first, last] = [weekStart, this.view.addDays(weekStart, 6)].map(
      (iso) => this.view.shortDateLine(iso).split(" ").slice(1).join(" "),
    );

    return `${first} – ${last}`;
  }

  tally(
    weekStart: string,
    calendarDays: DiaryCalendarDay[],
    todayIso: string,
  ): DiaryWeekTally {
    const dates = new Set(
      this.dates(weekStart).filter((date) => date <= todayIso),
    );
    const logged = calendarDays.filter(
      (day) => dates.has(day.date) && day.entryCount > 0,
    );

    return {
      logged: logged.length,
      onTarget: logged.filter((day) => day.status === "green").length,
    };
  }

  dates(weekStart: string): string[] {
    return Array.from({ length: DAYS_IN_WEEK }, (_, index) =>
      this.view.addDays(weekStart, index),
    );
  }

  months(weekStart: string): string[] {
    const months = this.dates(weekStart).map((date) =>
      this.calendarView.monthOf(date),
    );

    return [...new Set(months)];
  }

  contains(weekStart: string, iso: string): boolean {
    return this.dates(weekStart).includes(iso);
  }

  days(
    weekStart: string,
    calendarDays: DiaryCalendarDay[],
    todayIso: string,
  ): WeekStripDay[] {
    const byDate = new Map(calendarDays.map((day) => [day.date, day]));
    const weekdays = this.calendarView.weekdays();

    return this.dates(weekStart).map((date, index) => ({
      key: date,
      date,
      weekday: weekdays[index],
      day: `${Number(date.slice(8, 10))}`,
      state:
        date === todayIso ? WeekStripDayState.Today : WeekStripDayState.Rest,
      tone: this.tone(byDate.get(date), date > todayIso),
      ariaLabel: this.view.dateLine(date),
    }));
  }

  private tone(
    day: DiaryCalendarDay | undefined,
    isFuture: boolean,
  ): WeekStripDayTone | undefined {
    if (!day) return undefined;
    if (!isFuture) return STATUS_TONES[day.status];

    return day.entryCount > 0 ? WeekStripDayTone.Planned : undefined;
  }
}
