import { Routes } from "@angular/router";
import { GetGymStatsProviders } from "@gym/analytics/stats/infrastructure/providers/get-gym-stats.providers";

export const DASHBOARD_ROUTES: Routes = [
  {
    path: "",
    providers: [...GetGymStatsProviders.getProviders()],
    loadComponent: () =>
      import("../components/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
];
