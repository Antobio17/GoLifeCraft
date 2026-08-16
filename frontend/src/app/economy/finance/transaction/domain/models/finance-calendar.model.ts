import { FinanceCalendarAttributes } from "./finance-calendar-attributes.model";

export interface FinanceCalendar {
  id: string;
  type: string;
  attributes: FinanceCalendarAttributes;
}
