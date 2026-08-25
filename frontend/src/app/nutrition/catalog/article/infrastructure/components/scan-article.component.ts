import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { PhotoCaptureComponent } from "@shared/design-system/photo-capture/infrastructure/components/photo-capture.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { SpinnerComponent } from "@shared/design-system/spinner/infrastructure/components/spinner.component";
import { ArticleFormSkeletonComponent } from "./article-form-skeleton.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ImportGlobalArticleService } from "@nutrition/global-catalog/article/application/services/import-global-article.service";
import { GetArticleDraftService } from "../../application/services/get-article-draft.service";
import { ArticleDraftStoreService } from "../../application/services/article-draft-store.service";
import { ArticleDraftSource } from "../../domain/models/article-draft-source.enum";
import { GetArticleDraftResponse } from "../../domain/models/article-draft-response.model";

@Component({
  selector: "app-scan-article",
  templateUrl: "./scan-article.component.html",
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    PhotoCaptureComponent,
    ButtonComponent,
    CardComponent,
    StackComponent,
    TextComponent,
    HeadingComponent,
    NoteComponent,
    SpinnerComponent,
    ArticleFormSkeletonComponent,
  ],
})
export class ScanArticleComponent implements OnInit {
  private translationService = inject(TranslationService);
  private getArticleDraftService = inject(GetArticleDraftService);
  private importGlobalArticleService = inject(ImportGlobalArticleService);
  private articleDraftStore = inject(ArticleDraftStoreService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/catalog/article";

  readonly maxPhotos = 3;

  photos = signal<File[]>([]);
  analyzing = signal(false);
  importing = signal(false);
  globalMatch = signal<GetArticleDraftResponse["data"] | null>(null);

  readonly hasPhotos = computed(() => this.photos().length > 0);
  readonly title = computed(() => this.t("scanArticle.title"));
  readonly matchName = computed(() => this.globalMatch()?.draft?.name ?? "");
  readonly matchBrand = computed(() => this.globalMatch()?.draft?.brand ?? "");

  ngOnInit(): void {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);
  }

  onPhotosChange(photos: File[]): void {
    this.photos.set(photos);
    this.globalMatch.set(null);
  }

  onAnalyze(): void {
    if (!this.hasPhotos() || this.analyzing()) {
      return;
    }

    this.analyzing.set(true);

    this.getArticleDraftService.getArticleDraft(this.photos()).subscribe({
      next: (response) => {
        this.analyzing.set(false);
        this.onDraft(response.data);
      },
      error: () => this.analyzing.set(false),
    });
  }

  onImport(): void {
    const globalArticleId = this.globalMatch()?.globalArticleId;

    if (!globalArticleId || this.importing()) {
      return;
    }

    this.importing.set(true);

    this.importGlobalArticleService
      .importGlobalArticle(globalArticleId)
      .subscribe({
        next: () => {
          this.importing.set(false);
          this.router.navigate(["/catalog"]);
        },
        error: () => this.importing.set(false),
      });
  }

  onFillByHand(): void {
    this.articleDraftStore.clear();
    this.router.navigate(["/catalog/create"]);
  }

  onEditMatch(): void {
    const match = this.globalMatch();

    if (!match?.draft) {
      return;
    }

    this.articleDraftStore.keep(match.draft, match.lowConfidenceFields);
    this.router.navigate(["/catalog/create"]);
  }

  cancel(): void {
    this.router.navigate(["/catalog"]);
  }

  private onDraft(data: GetArticleDraftResponse["data"]): void {
    if (ArticleDraftSource.GlobalCatalog === data.source) {
      this.globalMatch.set(data);
      return;
    }

    if (null === data.draft) {
      this.floatingToastService.showToast({
        status: 422,
        keyTranslation: "article.draft.not.recognized",
        details: [],
      });
      return;
    }

    this.articleDraftStore.keep(data.draft, data.lowConfidenceFields);
    this.router.navigate(["/catalog/create"]);
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }
}
