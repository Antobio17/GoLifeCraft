import { UserUsage } from "./user-usage.model";

export interface GetUserUsageResponse {
  data: {
    id: string;
    type: string;
    attributes: Omit<UserUsage, "id">;
  };
}
