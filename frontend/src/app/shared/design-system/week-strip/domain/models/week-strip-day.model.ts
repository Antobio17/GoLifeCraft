import { WeekStripDayState } from "./week-strip-day-state.enum";

export interface WeekStripDay {
  key: string;
  weekday: string;
  day: string;
  state: WeekStripDayState;
  ariaLabel: string;
}
