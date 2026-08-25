import { Routes } from "@angular/router";
import { GetEconomyProviders } from "../providers/get-economy.providers";
import { EconomyWriteProviders } from "../providers/economy-write.providers";
import { FinanceAccountProviders } from "@economy/finance/account/infrastructure/providers/finance-account.providers";
import { FinanceBalanceCheckProviders } from "@economy/finance/balance-check/infrastructure/providers/finance-balance-check.providers";
import { FinanceRecurrenceProviders } from "@economy/finance/recurrence/infrastructure/providers/finance-recurrence.providers";
import { FinanceBudgetProviders } from "@economy/finance/budget/infrastructure/providers/finance-budget.providers";

export const ECONOMY_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetEconomyProviders.getProviders(),
      ...EconomyWriteProviders.getProviders(),
      ...FinanceAccountProviders.getProviders(),
      ...FinanceBalanceCheckProviders.getProviders(),
      ...FinanceRecurrenceProviders.getProviders(),
      ...FinanceBudgetProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-economy.component").then(
            (m) => m.GetEconomyComponent,
          ),
      },
      {
        path: "recurrences",
        data: { breadcrumb: "getFinanceRecurrences.breadcrumb.list" },
        loadComponent: () =>
          import("@economy/finance/recurrence/infrastructure/components/get-finance-recurrences.component").then(
            (m) => m.GetFinanceRecurrencesComponent,
          ),
      },
      {
        path: "accounts",
        data: { breadcrumb: "getFinanceAccounts.breadcrumb.list" },
        loadComponent: () =>
          import("@economy/finance/account/infrastructure/components/get-finance-accounts.component").then(
            (m) => m.GetFinanceAccountsComponent,
          ),
      },
      {
        path: "budget",
        data: { breadcrumb: "getFinanceBudget.breadcrumb.list" },
        loadComponent: () =>
          import("@economy/finance/budget/infrastructure/components/get-finance-budget.component").then(
            (m) => m.GetFinanceBudgetComponent,
          ),
      },
      {
        path: "budget/settings",
        data: { breadcrumb: "saveFinanceBudget.breadcrumb.settings" },
        loadComponent: () =>
          import("@economy/finance/budget/infrastructure/components/save-finance-budget.component").then(
            (m) => m.SaveFinanceBudgetComponent,
          ),
      },
    ],
  },
];
