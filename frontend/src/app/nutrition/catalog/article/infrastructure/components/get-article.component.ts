import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  ArticleDetailView,
  ArticleViewService,
} from "@nutrition/catalog/article/application/services/article-view.service";
import { GetArticleService } from "@nutrition/catalog/article/application/services/get-article.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
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
    SkeletonComponent,
    EmptyStateComponent,
    TextComponent,
  ],
})
export class GetArticleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private getArticleService = inject(GetArticleService);
  protected view = inject(ArticleViewService);

  loading = signal(true);
  notFound = signal(false);
  detail = signal<ArticleDetailView | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");

    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

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
}
