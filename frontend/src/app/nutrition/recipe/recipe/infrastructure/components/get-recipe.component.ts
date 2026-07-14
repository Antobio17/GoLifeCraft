import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { delay, tap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ProductHeroComponent } from "@shared/design-system/product-hero/infrastructure/components/product-hero.component";
import { MacroBarsComponent } from "@shared/design-system/macro-bars/infrastructure/components/macro-bars.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { GetRecipeService } from "@nutrition/recipe/recipe/application/services/get-recipe.service";
import { DeleteRecipeService } from "@nutrition/recipe/recipe/application/services/delete-recipe.service";
import { RecipeViewService } from "@nutrition/recipe/recipe/application/services/recipe-view.service";
import { RecipeDetail } from "@nutrition/recipe/recipe/domain/models/recipe.model";

@Component({
  selector: "app-get-recipe",
  templateUrl: "./get-recipe.component.html",
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    ProductHeroComponent,
    MacroBarsComponent,
    SectionHeaderComponent,
    CardComponent,
    StackComponent,
    ChipComponent,
    TextComponent,
    HeadingComponent,
    IconButtonComponent,
    EmojiTileComponent,
    NoteComponent,
    SkeletonComponent,
    EmptyStateComponent,
    ConfirmActionModalComponent,
  ],
})
export class GetRecipeComponent implements OnInit {
  private translationService = inject(TranslationService);
  private getRecipeService = inject(GetRecipeService);
  private deleteRecipeService = inject(DeleteRecipeService);
  private authSession = inject(AuthSessionService);
  private floatingToastService = inject(FloatingToastService);
  protected view = inject(RecipeViewService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly MODULE_PATH = "nutrition/recipe/recipe";

  canWrite = this.authSession.isGod();

  loading = signal(true);
  recipe = signal<RecipeDetail | null>(null);
  showDeleteModal = signal(false);
  deleting = signal(false);

  private id = "";

  attributes = computed(() => this.recipe()?.attributes ?? null);

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get("id") ?? "";

    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.getRecipeService.getRecipe(this.id).subscribe({
          next: (response) => {
            this.recipe.set(response.data);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      });
  }

  t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  totalLabel(calories: number): string {
    return `${this.t("getRecipe.total")} ${this.view.integer(calories)} ${this.t("getRecipe.macro.kcal")}`;
  }

  back(): void {
    this.router.navigate(["/recipes"]);
  }

  onEdit(): void {
    this.router.navigate(["/recipes", this.id, "edit"]);
  }

  onDelete(): void {
    this.showDeleteModal.set(true);
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  onConfirmDelete(): void {
    this.deleting.set(true);

    this.deleteRecipeService
      .deleteRecipe(this.id)
      .pipe(
        tap(() => {
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "recipe.delete.success",
            details: [],
          });
        }),
        delay(600),
      )
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.showDeleteModal.set(false);
          this.router.navigate(["/recipes"]);
        },
        error: () => {
          this.deleting.set(false);
          this.showDeleteModal.set(false);
        },
      });
  }
}
