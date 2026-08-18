import { FinanceRecurrence } from "./finance-recurrence.model";

export interface FinanceRecurrenceRow {
  recurrence: FinanceRecurrence;
  emoji: string;
  amountLabel: string;
  scheduleLabel: string;
  nextChargeLabel: string;
}
