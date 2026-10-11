import { UserUsageDay } from "./user-usage-day.model";

export interface UserUsageSummary {
  id: string;
  provisioned: boolean;
  lastActivityAt: string | null;
  activeModules: string[];
  dailyActivity: UserUsageDay[];
}
