import { FinanceCalendarDay } from "./finance-calendar-day.model";

export interface FinanceCalendarAttributes {
  month: string;
  days: FinanceCalendarDay[];
  expense: number;
  income: number;
}
