import { Routes } from "@angular/router";
import { GetGymStatsProviders } from "@gym/analytics/stats/infrastructure/providers/get-gym-stats.providers";
import { GetDiaryProviders } from "@nutrition/diary/diary/infrastructure/providers/get-diary.providers";
import { AgendaSummaryProviders } from "@agenda/agenda/agenda/infrastructure/providers/agenda-summary.providers";
import { FinanceSavingsSummaryProviders } from "@economy/finance/budget/infrastructure/providers/finance-savings-summary.providers";

export const DASHBOARD_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetGymStatsProviders.getProviders(),
      ...GetDiaryProviders.getProviders(),
      ...AgendaSummaryProviders.getProviders(),
      ...FinanceSavingsSummaryProviders.getProviders(),
    ],
    loadComponent: () =>
      import("../components/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
];
