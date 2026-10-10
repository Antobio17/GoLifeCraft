import { WeekStripDayState } from "./week-strip-day-state.enum";
import { WeekStripDayTone } from "./week-strip-day-tone.enum";

export interface WeekStripDay {
  key: string;
  date: string;
  weekday: string;
  day: string;
  state: WeekStripDayState;
  tone?: WeekStripDayTone;
  ariaLabel: string;
}
