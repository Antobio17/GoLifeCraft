import { Routes } from "@angular/router";
import { GetEconomyProviders } from "../providers/get-economy.providers";
import { EconomyWriteProviders } from "../providers/economy-write.providers";
import { FinanceAccountProviders } from "@economy/finance/account/infrastructure/providers/finance-account.providers";
import { FinanceBalanceCheckProviders } from "@economy/finance/balance-check/infrastructure/providers/finance-balance-check.providers";

export const ECONOMY_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetEconomyProviders.getProviders(),
      ...EconomyWriteProviders.getProviders(),
      ...FinanceAccountProviders.getProviders(),
      ...FinanceBalanceCheckProviders.getProviders(),
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
        path: "accounts",
        data: { breadcrumb: "getFinanceAccounts.breadcrumb.list" },
        loadComponent: () =>
          import("@economy/finance/account/infrastructure/components/get-finance-accounts.component").then(
            (m) => m.GetFinanceAccountsComponent,
          ),
      },
    ],
  },
];
