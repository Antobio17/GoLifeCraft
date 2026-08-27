import { Routes } from "@angular/router";
import { UndoProvider } from "@shared/undo/infrastructure/providers/undo.provider";
import { CookChoiceService } from "@nutrition/kitchen/production/application/services/cook-choice.service";
import { KitchenDayViewService } from "@nutrition/kitchen/production/application/services/kitchen-day-view.service";
import { KitchenFormatService } from "@nutrition/kitchen/production/application/services/kitchen-format.service";
import { ProductionViewService } from "@nutrition/kitchen/production/application/services/production-view.service";
import { InMemoryKitchenStore } from "@nutrition/kitchen/production/infrastructure/adapters/in-memory-kitchen-store";
import { GetKitchenDayProviders } from "../providers/get-kitchen-day.providers";
import { GetProductionProviders } from "../providers/get-production.providers";
import { StartProductionProviders } from "../providers/start-production.providers";
import { FinishProductionProviders } from "../providers/finish-production.providers";
import { DiscardProductionProviders } from "../providers/discard-production.providers";
import { UpdateRecipeStockProviders } from "../providers/update-recipe-stock.providers";

export const KITCHEN_ROUTES: Routes = [
  {
    path: "",
    providers: [
      InMemoryKitchenStore,
      KitchenFormatService,
      KitchenDayViewService,
      ProductionViewService,
      CookChoiceService,
      ...GetKitchenDayProviders.getProviders(),
      ...GetProductionProviders.getProviders(),
      ...StartProductionProviders.getProviders(),
      ...FinishProductionProviders.getProviders(),
      ...DiscardProductionProviders.getProviders(),
      ...UpdateRecipeStockProviders.getProviders(),
      ...UndoProvider.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-kitchen-day.component").then(
            (m) => m.GetKitchenDayComponent,
          ),
      },
      {
        path: ":id",
        data: { breadcrumb: "getProduction.breadcrumb.detail" },
        loadComponent: () =>
          import("../components/get-production.component").then(
            (m) => m.GetProductionComponent,
          ),
      },
    ],
  },
];
