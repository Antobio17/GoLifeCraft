import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  ArticleDetailView,
  ArticleMacroSet,
  ArticleViewService,
} from "@nutrition/catalog/article/application/services/article-view.service";
import { GetArticleService } from "@nutrition/catalog/article/application/services/get-article.service";
import { DeleteArticleService } from "@nutrition/catalog/article/application/services/delete-article.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonChipsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-chips.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonHeroComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-hero.component";
import { SkeletonMacroBarsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-macro-bars.component";
import { SkeletonRowsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-rows.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { ProductHeroComponent } from "@shared/design-system/product-hero/infrastructure/components/product-hero.component";
import { MacroBarsComponent } from "@shared/design-system/macro-bars/infrastructure/components/macro-bars.component";
import { NutritionFactsComponent } from "@shared/design-system/nutrition-facts/infrastructure/components/nutrition-facts.component";
import { SegmentedToggleComponent } from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { EquivalenceSummaryComponent } from "@shared/design-system/equivalence-summary/infrastructure/components/equivalence-summary.component";
import { PurchaseSummaryComponent } from "@shared/design-system/purchase-summary/infrastructure/components/purchase-summary.component";

type NutritionMode = "pack" | "per100";

@Component({
  selector: "app-get-article",
  templateUrl: "./get-article.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    ConfirmActionModalComponent,
    SkeletonComponent,
    SkeletonChipsComponent,
    SkeletonLineComponent,
    SkeletonScreenHeaderComponent,
    SkeletonHeroComponent,
    SkeletonMacroBarsComponent,
    SkeletonRowsComponent,
    EmptyStateComponent,
    TextComponent,
    StackComponent,
    ChipComponent,
    IconButtonComponent,
    ProductHeroComponent,
    MacroBarsComponent,
    NutritionFactsComponent,
    SegmentedToggleComponent,
    EquivalenceSummaryComponent,
    PurchaseSummaryComponent,
  ],
})
export class GetArticleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private getArticleService = inject(GetArticleService);
  private deleteArticleService = inject(DeleteArticleService);
  private authSession = inject(AuthSessionService);
  protected view = inject(ArticleViewService);

  loading = signal(true);
  notFound = signal(false);
  detail = signal<ArticleDetailView | null>(null);
  showDeleteModal = signal(false);
  deleting = signal(false);
  canWrite = this.authSession.isGod();
  mode = signal<NutritionMode>("per100");
  activeMacros = computed<ArticleMacroSet | null>(() => {
    const detail = this.detail();
    if (null === detail) return null;

    return "pack" === this.mode() ? detail.pack : detail.per100;
  });
  private id = "";

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");

    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.id = id;

    this.getArticleService.getArticle(id).subscribe({
      next: (response) => {
        const detail = this.view.toDetail(response.data);
        this.detail.set(detail);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(["/catalog"]);
  }

  setMode(value: string): void {
    this.mode.set(value as NutritionMode);
  }

  onEdit(): void {
    this.router.navigate(["/catalog", this.id, "edit"]);
  }

  onDelete(): void {
    this.showDeleteModal.set(true);
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  onConfirmDelete(): void {
    this.deleting.set(true);

    this.deleteArticleService.deleteArticle(this.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.router.navigate(["/catalog"]);
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      },
    });
  }
}
