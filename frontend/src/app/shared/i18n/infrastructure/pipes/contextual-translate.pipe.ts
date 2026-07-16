import { Pipe, PipeTransform, inject } from "@angular/core";
import { TranslationService } from "../../application/services/translation.service";

@Pipe({
  name: "t",
  pure: false,
})
export class ContextualTranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  private readonly CONTEXT_MAP: { [key: string]: string } = {
    login: "authorization/login/login",
    register: "authorization/register/register",
    user: "authorization/user/user",
    profile: "authorization/user/user",
    settings: "authorization/user/user",
    dashboard: "dashboard/dashboard",
    formInput: "shared/design-system/form-input",
    pagination: "shared/design-system/pagination",
    listFilters: "shared/design-system/list-filters",
    listTable: "shared/design-system/list-table",
    navbar: "layouts/layout/navbar/navbar",
    getExercises: "gym/library/exercise",
    createExercise: "gym/library/exercise",
    updateExercise: "gym/library/exercise",
    exercise: "gym/library/exercise",
    getSessions: "gym/training/session",
    getSession: "gym/training/session",
    createSession: "gym/training/session",
    updateSession: "gym/training/session",
    session: "gym/training/session",
    gym: "gym/training/session",
    getArticles: "nutrition/catalog/article",
    getArticle: "nutrition/catalog/article",
    articleEditor: "nutrition/catalog/article",
    article: "nutrition/catalog/article",
    getDiary: "nutrition/diary/diary",
    getRecipes: "nutrition/recipe/recipe",
    getRecipe: "nutrition/recipe/recipe",
    recipeEditor: "nutrition/recipe/recipe",
    recipe: "nutrition/recipe/recipe",
    getWorkouts: "gym/training/workout",
    getWorkout: "gym/training/workout",
    workout: "gym/training/workout",
    role: "authorization/user/user",
    creating: "authorization/user/user",
    cannot: "authorization/user/user",
    access: "authorization/user/user",
    new: "authorization/user/user",
    the: "shared/argument-errors",
    error: "shared/argument-errors",
    handler: "shared/argument-errors",
    token: "shared/argument-errors",
    floatingToast: "shared/floating-toasts",
  };

  transform(key: string, params?: Record<string, unknown>): string {
    if (!key) {
      return key;
    }

    const contextPrefix = key.split(".")[0];
    const modulePath = this.CONTEXT_MAP[contextPrefix];

    if (!modulePath) {
      return key;
    }

    if (!this.translationService.isModuleLoaded(modulePath)) {
      this.translationService.loadModuleTranslations(modulePath);
    }

    return this.translationService.translate(key, modulePath, params);
  }
}
