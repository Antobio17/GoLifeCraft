import { UserUsageDay } from "./user-usage-day.model";
import { UserUsageMetric } from "./user-usage-metric.model";
import { UserUsageModule } from "./user-usage-module.model";
import { UserUsageMonth } from "./user-usage-month.model";

export interface UserUsage {
  id: string;
  tenantId: string;
  provisioned: boolean;
  totalRecords: number;
  totalEvents: number;
  firstActivityAt: string | null;
  lastActivityAt: string | null;
  lastWorkoutAt: string | null;
  metrics: UserUsageMetric[];
  modules: UserUsageModule[];
  dailyActivity: UserUsageDay[];
  monthlyActivity: UserUsageMonth[];
}
