import { UserUsageSummary } from "./user-usage-summary.model";

export interface GetUsersUsageResponse {
  data: {
    id: string;
    type: string;
    attributes: Omit<UserUsageSummary, "id">;
  }[];
}
