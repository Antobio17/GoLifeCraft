import { Routes } from "@angular/router";
import { EmojiCatalogService } from "@nutrition/catalog/article/application/services/emoji-catalog.service";
import { GetArticlesProviders } from "@nutrition/catalog/article/infrastructure/providers/get-articles.providers";
import { GetRecipesProviders } from "../providers/get-recipes.providers";
import { GetRecipeProviders } from "../providers/get-recipe.providers";
import { UpdateRecipeStockProviders } from "@nutrition/pantry/recipe-stock/infrastructure/providers/update-recipe-stock.providers";
import { RecipeStockViewService } from "@nutrition/pantry/recipe-stock/application/services/recipe-stock-view.service";
import { AutosaveProvider } from "@shared/autosave/infrastructure/providers/autosave.provider";
import { UploadImageProviders } from "@shared/image-upload/infrastructure/providers/upload-image.providers";
import { CreateRecipeProviders } from "../providers/create-recipe.providers";
import { UpdateRecipeProviders } from "../providers/update-recipe.providers";
import { DeleteRecipeProviders } from "../providers/delete-recipe.providers";
import { RecipeCategoryService } from "../../application/services/recipe-category.service";
import { RecipeFormService } from "../../application/services/recipe-form.service";

export const RECIPE_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetRecipesProviders.getProviders(),
      ...GetRecipeProviders.getProviders(),
      ...UpdateRecipeStockProviders.getProviders(),
      RecipeStockViewService,
      ...AutosaveProvider.getProviders(),
      ...UploadImageProviders.getProviders(),
      ...CreateRecipeProviders.getProviders(),
      ...UpdateRecipeProviders.getProviders(),
      ...DeleteRecipeProviders.getProviders(),
      ...GetArticlesProviders.getProviders(),
      EmojiCatalogService,
      RecipeCategoryService,
      RecipeFormService,
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-recipes.component").then(
            (m) => m.GetRecipesComponent,
          ),
      },
      {
        path: "create",
        data: { breadcrumb: "recipe.breadcrumb.create" },
        loadComponent: () =>
          import("../components/recipe-editor.component").then(
            (m) => m.RecipeEditorComponent,
          ),
      },
      {
        path: ":id/edit",
        data: { breadcrumb: "recipe.breadcrumb.edit" },
        loadComponent: () =>
          import("../components/recipe-editor.component").then(
            (m) => m.RecipeEditorComponent,
          ),
      },
      {
        path: ":id",
        data: { breadcrumb: "recipe.breadcrumb.detail" },
        loadComponent: () =>
          import("../components/get-recipe.component").then(
            (m) => m.GetRecipeComponent,
          ),
      },
    ],
  },
];
