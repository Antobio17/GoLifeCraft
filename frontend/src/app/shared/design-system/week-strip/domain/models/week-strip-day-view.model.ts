import { WeekStripDay } from "./week-strip-day.model";
import { WeekStripDayTone } from "./week-strip-day-tone.enum";

export interface WeekStripDayView {
  day: WeekStripDay;
  tone: WeekStripDayTone | null;
  isToday: boolean;
  isDone: boolean;
  isTodayOnTone: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
}
