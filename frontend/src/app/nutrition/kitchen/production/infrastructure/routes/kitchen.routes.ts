import { Routes } from "@angular/router";
import { KitchenFormatService } from "@nutrition/kitchen/production/application/services/kitchen-format.service";
import { ProductionRangeService } from "@nutrition/kitchen/production/application/services/production-range.service";
import { ProductionViewService } from "@nutrition/kitchen/production/application/services/production-view.service";
import { ProposalFormService } from "@nutrition/kitchen/production/application/services/proposal-form.service";
import { GetProductionsProviders } from "../providers/get-productions.providers";
import { GetProductionProviders } from "../providers/get-production.providers";
import { GetProductionRecipeProviders } from "../providers/get-production-recipe.providers";
import { GetProductionProposalProviders } from "../providers/get-production-proposal.providers";
import { StartProductionProviders } from "../providers/start-production.providers";
import { CookProductionItemProviders } from "../providers/cook-production-item.providers";
import { UncookProductionItemProviders } from "../providers/uncook-production-item.providers";
import { CheckProductionItemProviders } from "../providers/check-production-item.providers";
import { FinishProductionProviders } from "../providers/finish-production.providers";
import { ReopenProductionProviders } from "../providers/reopen-production.providers";
import { DiscardProductionProviders } from "../providers/discard-production.providers";
import { UpdateRecipeStockProviders } from "../providers/update-recipe-stock.providers";

export const KITCHEN_ROUTES: Routes = [
  {
    path: "",
    providers: [
      KitchenFormatService,
      ProductionRangeService,
      ProductionViewService,
      ProposalFormService,
      ...GetProductionsProviders.getProviders(),
      ...GetProductionProviders.getProviders(),
      ...GetProductionRecipeProviders.getProviders(),
      ...GetProductionProposalProviders.getProviders(),
      ...StartProductionProviders.getProviders(),
      ...CookProductionItemProviders.getProviders(),
      ...UncookProductionItemProviders.getProviders(),
      ...CheckProductionItemProviders.getProviders(),
      ...FinishProductionProviders.getProviders(),
      ...ReopenProductionProviders.getProviders(),
      ...DiscardProductionProviders.getProviders(),
      ...UpdateRecipeStockProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-productions.component").then(
            (m) => m.GetProductionsComponent,
          ),
      },
      {
        path: "nueva",
        data: { breadcrumb: "createProduction.breadcrumb" },
        loadComponent: () =>
          import("../components/create-production.component").then(
            (m) => m.CreateProductionComponent,
          ),
      },
      {
        path: ":id/:itemId",
        data: { breadcrumb: "getProductionRecipe.breadcrumb" },
        loadComponent: () =>
          import("../components/get-production-recipe.component").then(
            (m) => m.GetProductionRecipeComponent,
          ),
      },
      {
        path: ":id",
        data: { breadcrumb: "getProduction.breadcrumb" },
        loadComponent: () =>
          import("../components/get-production.component").then(
            (m) => m.GetProductionComponent,
          ),
      },
    ],
  },
];
