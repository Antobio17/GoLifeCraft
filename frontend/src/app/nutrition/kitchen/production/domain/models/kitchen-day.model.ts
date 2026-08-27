import { KitchenDone } from "./kitchen-done.model";
import { KitchenExpected } from "./kitchen-expected.model";
import { KitchenToCook } from "./kitchen-to-cook.model";
import { KitchenWeekDay } from "./kitchen-week-day.model";

export interface KitchenDay {
  date: string;
  toCook: KitchenToCook[];
  expected: KitchenExpected[];
  done: KitchenDone[];
  weekDays: KitchenWeekDay[];
}
