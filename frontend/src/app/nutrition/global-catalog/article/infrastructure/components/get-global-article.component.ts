import { Component, inject, input, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { GlobalArticleDetailView } from "@nutrition/global-catalog/article/domain/models/global-article-detail-view.model";
import { GlobalArticleViewService } from "@nutrition/global-catalog/article/application/services/global-article-view.service";
import { GetGlobalArticleService } from "@nutrition/global-catalog/article/application/services/get-global-article.service";
import { ImportGlobalArticleService } from "@nutrition/global-catalog/article/application/services/import-global-article.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { SkeletonHeroComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-hero.component";
import { SkeletonChipsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-chips.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { SkeletonMacroBarsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-macro-bars.component";
import { SkeletonRowsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-rows.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ProductHeroComponent } from "@shared/design-system/product-hero/infrastructure/components/product-hero.component";
import { MacroBarsComponent } from "@shared/design-system/macro-bars/infrastructure/components/macro-bars.component";
import { NutritionFactsComponent } from "@shared/design-system/nutrition-facts/infrastructure/components/nutrition-facts.component";
import { PanelComponent } from "@shared/design-system/panel/infrastructure/components/panel.component";

@Component({
  selector: "app-get-global-article",
  templateUrl: "./get-global-article.component.html",
  styleUrl: "./get-global-article.component.css",
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    SplitViewComponent,
    ScreenHeaderComponent,
    SkeletonScreenHeaderComponent,
    SkeletonHeroComponent,
    SkeletonChipsComponent,
    SkeletonComponent,
    SkeletonLineComponent,
    SkeletonMacroBarsComponent,
    SkeletonRowsComponent,
    EmptyStateComponent,
    TextComponent,
    StackComponent,
    ChipComponent,
    ButtonComponent,
    ProductHeroComponent,
    MacroBarsComponent,
    NutritionFactsComponent,
    PanelComponent,
  ],
})
export class GetGlobalArticleComponent {
  private router = inject(Router);
  private getGlobalArticleService = inject(GetGlobalArticleService);
  private importGlobalArticleService = inject(ImportGlobalArticleService);
  private floatingToastService = inject(FloatingToastService);
  private authSession = inject(AuthSessionService);
  protected view = inject(GlobalArticleViewService);

  readonly id = input.required<string>();

  loading = signal(true);
  notFound = signal(false);
  detail = signal<GlobalArticleDetailView | null>(null);
  importing = signal(false);
  imported = signal(false);
  canImport = this.authSession.isAuthenticated();

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((id) => {
          this.loading.set(true);
          this.notFound.set(false);
          this.imported.set(false);
          return this.getGlobalArticleService
            .getGlobalArticle(id)
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        this.detail.set(response ? this.view.toDetail(response.data) : null);
        this.notFound.set(null === response);
        this.loading.set(false);
      });
  }

  goBack(): void {
    this.router.navigate(["/global-catalog"]);
  }

  onImport(): void {
    if (!this.canImport || this.importing() || this.imported()) return;

    this.importing.set(true);

    this.importGlobalArticleService.importGlobalArticle(this.id()).subscribe({
      next: () => this.markImported(),
      error: (error) => this.handleImportError(error),
    });
  }

  private handleImportError(error: { status?: number }): void {
    if (409 === error.status) {
      this.markImported();
      return;
    }

    this.importing.set(false);
    this.floatingToastService.showToast({
      status: 500,
      keyTranslation: "getGlobalArticle.toast.error",
      details: [],
    });
  }

  private markImported(): void {
    this.imported.set(true);
    this.importing.set(false);
  }
}
