import { FinanceOverviewAttributes } from "./finance-overview-attributes.model";

export interface FinanceOverview {
  id: string;
  type: string;
  attributes: FinanceOverviewAttributes;
}
