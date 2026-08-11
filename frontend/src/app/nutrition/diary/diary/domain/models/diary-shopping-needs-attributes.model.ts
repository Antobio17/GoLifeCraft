import { DiaryShoppingNeed } from "./diary-shopping-need.model";

export interface DiaryShoppingNeedsAttributes {
  fromDate: string;
  toDate: string;
  dayCount: number;
  entryCount: number;
  needs: DiaryShoppingNeed[];
  needCount: number;
}
