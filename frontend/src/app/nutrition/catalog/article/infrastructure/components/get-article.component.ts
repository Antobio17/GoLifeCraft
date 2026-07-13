import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { delay, tap } from "rxjs/operators";
import {
  ArticleDetailView,
  ArticleViewService,
} from "@nutrition/catalog/article/application/services/article-view.service";
import { GetArticleService } from "@nutrition/catalog/article/application/services/get-article.service";
import { DeleteArticleService } from "@nutrition/catalog/article/application/services/delete-article.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";

@Component({
  selector: "app-get-article",
  templateUrl: "./get-article.component.html",
  styleUrl: "./get-article.component.scss",
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    ConfirmActionModalComponent,
    SkeletonComponent,
    EmptyStateComponent,
    TextComponent,
  ],
})
export class GetArticleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private getArticleService = inject(GetArticleService);
  private deleteArticleService = inject(DeleteArticleService);
  private authSession = inject(AuthSessionService);
  private floatingToastService = inject(FloatingToastService);
  protected view = inject(ArticleViewService);

  loading = signal(true);
  notFound = signal(false);
  detail = signal<ArticleDetailView | null>(null);
  showDeleteModal = signal(false);
  deleting = signal(false);
  canWrite = this.authSession.isGod();
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
        this.detail.set(this.view.toDetail(response.data));
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

    this.deleteArticleService
      .deleteArticle(this.id)
      .pipe(
        tap(() => {
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "article.delete.success",
            details: [],
          });
        }),
        delay(600),
      )
      .subscribe({
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
