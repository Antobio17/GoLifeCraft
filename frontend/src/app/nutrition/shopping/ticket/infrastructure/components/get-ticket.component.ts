import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { toObservable, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, debounceTime, switchMap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { MacroBadgesComponent } from "@shared/design-system/macro-badges/infrastructure/components/macro-badges.component";
import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";
import { ProgressBarComponent } from "@shared/design-system/progress-bar/infrastructure/components/progress-bar.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { TicketLineComponent } from "@shared/design-system/ticket-line/infrastructure/components/ticket-line.component";
import { ProductCardComponent } from "@shared/design-system/product-card/infrastructure/components/product-card.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonScreenHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-screen-header.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { Article } from "@nutrition/catalog/article/domain/models/article.model";
import {
  ArticleCardView,
  ArticleViewService,
} from "@nutrition/catalog/article/application/services/article-view.service";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
import { GetTicketService } from "@nutrition/shopping/ticket/application/services/get-ticket.service";
import { LinkTicketItemService } from "@nutrition/shopping/ticket/application/services/link-ticket-item.service";
import { RemoveTicketItemService } from "@nutrition/shopping/ticket/application/services/remove-ticket-item.service";
import { UnlinkTicketItemService } from "@nutrition/shopping/ticket/application/services/unlink-ticket-item.service";
import { UpdateTicketItemService } from "@nutrition/shopping/ticket/application/services/update-ticket-item.service";
import { ReceiveTicketService } from "@nutrition/shopping/ticket/application/services/receive-ticket.service";
import { UnreceiveTicketService } from "@nutrition/shopping/ticket/application/services/unreceive-ticket.service";
import { DeleteTicketService } from "@nutrition/shopping/ticket/application/services/delete-ticket.service";
import { TicketViewService } from "@nutrition/shopping/ticket/application/services/ticket-view.service";
import { TicketDetailAttributes } from "../../domain/models/ticket-detail-attributes.model";
import { TicketItem } from "../../domain/models/ticket-item.model";
import { TicketLineRow } from "../../domain/models/ticket-line-row.model";
import { TicketStatus } from "../../domain/models/ticket-status.model";

@Component({
  selector: "app-get-ticket",
  templateUrl: "./get-ticket.component.html",
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    SplitViewComponent,
    StackComponent,
    CardComponent,
    TextComponent,
    MacroBadgesComponent,
    ProgressBarComponent,
    ButtonComponent,
    TicketLineComponent,
    ProductCardComponent,
    ModalSheetComponent,
    SearchInputComponent,
    ConfirmActionModalComponent,
    SectionHeaderComponent,
    EmptyStateComponent,
    SkeletonComponent,
    SkeletonScreenHeaderComponent,
    RevealDirective,
  ],
})
export class GetTicketComponent {
  private static readonly PICKER_SIZE = 20;

  private translationService = inject(TranslationService);
  private getTicketService = inject(GetTicketService);
  private linkTicketItemService = inject(LinkTicketItemService);
  private unlinkTicketItemService = inject(UnlinkTicketItemService);
  private removeTicketItemService = inject(RemoveTicketItemService);
  private updateTicketItemService = inject(UpdateTicketItemService);
  private receiveTicketService = inject(ReceiveTicketService);
  private unreceiveTicketService = inject(UnreceiveTicketService);
  private deleteTicketService = inject(DeleteTicketService);
  private getArticlesService = inject(GetArticlesService);
  private articleView = inject(ArticleViewService);
  private entityVisual = inject(EntityVisualService);
  private ticketView = inject(TicketViewService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/shopping/ticket";

  private readonly quantityTyped = new Subject<TicketItem>();

  readonly id = input.required<string>();

  attributes = signal<TicketDetailAttributes | null>(null);
  loading = signal(true);
  receiving = signal(false);
  unreceiving = signal(false);
  deleting = signal(false);
  showDeleteModal = signal(false);

  pendingQuantities = signal<Record<string, number>>({});

  pickerOpen = signal(false);
  pickerItemId = signal<string | null>(null);
  pickerSearch = signal("");
  pickerLoading = signal(false);
  articles = signal<Article[]>([]);

  storeLabel = computed(() => {
    const attributes = this.attributes();

    if (null === attributes) return "";

    return this.ticketView.storeLabel(attributes);
  });

  headerSubtitle = computed(() => {
    const attributes = this.attributes();

    if (null === attributes) return "";

    return [
      this.ticketView.dateLabel(attributes.purchasedOn),
      this.ticketView.money(attributes.total),
      this.t(this.ticketView.statusKey(attributes.status)),
    ].join(" · ");
  });

  summaryBadges = computed<MacroBadge[]>(() => {
    const attributes = this.attributes();

    if (null === attributes) return [];

    return [
      {
        label: `${attributes.linkedItems}/${attributes.totalItems}`,
        value: this.t("getTicket.stat.linked"),
      },
      {
        label: `${attributes.pendingItems}`,
        value: this.t("getTicket.stat.pending"),
      },
      {
        label: this.ticketView.money(attributes.linkedAmount),
        value: this.t("getTicket.stat.amount"),
      },
    ];
  });

  progressPercent = computed(() => {
    const attributes = this.attributes();

    if (null === attributes) return 0;

    return this.ticketView.progressPercent(
      attributes.linkedItems,
      attributes.totalItems,
    );
  });

  lineRows = computed<TicketLineRow[]>(() =>
    (this.attributes()?.items ?? []).map((item) =>
      this.ticketView.lineRowOf(
        this.ticketView.withQuantity(item, this.pendingQuantities()[item.id]),
        (key) => this.t(key),
      ),
    ),
  );

  receivableCount = computed(
    () =>
      (this.attributes()?.items ?? []).filter(
        (item) => null !== item.articleId && !item.received,
      ).length,
  );

  pendingCount = computed(
    () =>
      (this.attributes()?.items ?? []).filter((item) => null === item.articleId)
        .length,
  );

  isReceived = computed(
    () => TicketStatus.RECEIVED === this.attributes()?.status,
  );

  canDelete = computed(
    () =>
      0 ===
      (this.attributes()?.items ?? []).filter((item) => item.received).length,
  );

  hint = computed(() => {
    if (this.pendingCount() > 0) {
      return this.translationService.translate(
        "getTicket.pendingHint",
        this.MODULE_PATH,
        { count: this.pendingCount() },
      );
    }

    if (TicketStatus.RECEIVED === this.attributes()?.status) {
      return this.t("getTicket.receivedHint");
    }

    return this.t("getTicket.draftHint");
  });

  pickerCards = computed<ArticleCardView[]>(() =>
    this.articles().map((article) =>
      this.articleView.toCard(article, this.imageUrl(article)),
    ),
  );

  constructor() {
    this.quantityTyped
      .pipe(debounceTime(600), takeUntilDestroyed(this.destroyRef))
      .subscribe((item) => this.saveQuantity(item));

    toObservable(this.id)
      .pipe(
        switchMap((ticketId) => {
          this.loading.set(true);

          return this.getTicketService.getTicket(ticketId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.translationService
            .loadModuleTranslations(this.MODULE_PATH)
            .then(() => {
              this.attributes.set(response.data.attributes);
              this.loading.set(false);
            });
        },
        error: () => this.loading.set(false),
      });
  }

  protected t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  back(): void {
    this.router.navigate(["/tickets"]);
  }

  openPicker(itemId: string): void {
    this.pickerItemId.set(itemId);
    this.pickerSearch.set("");
    this.pickerOpen.set(true);
    this.loadArticles();
  }

  closePicker(): void {
    this.pickerOpen.set(false);
    this.pickerItemId.set(null);
  }

  onPickerSearch(needle: string): void {
    this.pickerSearch.set(needle);
    this.loadArticles();
  }

  onPick(articleId: string): void {
    const itemId = this.pickerItemId();

    if (null === itemId) return;

    this.closePicker();
    this.link(itemId, articleId);
  }

  onQuantityChange(row: TicketLineRow, quantity: number): void {
    if (quantity <= 0) return;

    this.pendingQuantities.update((pending) => ({
      ...pending,
      [row.item.id]: quantity,
    }));
    this.quantityTyped.next({ ...row.item, quantity });
  }

  onUnlink(row: TicketLineRow): void {
    this.unlinkTicketItemService
      .unlinkTicketItem(this.id(), row.item.id)
      .subscribe({ next: () => this.refresh() });
  }

  onRemove(row: TicketLineRow): void {
    this.removeTicketItemService
      .removeTicketItem(this.id(), row.item.id)
      .subscribe({ next: () => this.refresh() });
  }

  onReceive(): void {
    this.receiving.set(true);

    this.receiveTicketService.receiveTicket(this.id()).subscribe({
      next: () => this.refresh(() => this.receiving.set(false)),
      error: () => this.receiving.set(false),
    });
  }

  onUnreceive(): void {
    this.unreceiving.set(true);

    this.unreceiveTicketService.unreceiveTicket(this.id()).subscribe({
      next: () => this.refresh(() => this.unreceiving.set(false)),
      error: () => this.unreceiving.set(false),
    });
  }

  onDelete(): void {
    this.showDeleteModal.set(true);
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  onConfirmDelete(): void {
    this.deleting.set(true);

    this.deleteTicketService.deleteTicket(this.id()).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.router.navigate(["/tickets"]);
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      },
    });
  }

  private saveQuantity(item: TicketItem): void {
    this.updateTicketItemService
      .updateTicketItem(this.id(), item.id, {
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })
      .subscribe({ next: () => this.refresh() });
  }

  private link(itemId: string, articleId: string): void {
    this.linkTicketItemService
      .linkTicketItem(this.id(), itemId, articleId)
      .subscribe({ next: () => this.refresh() });
  }

  private loadArticles(): void {
    this.pickerLoading.set(true);

    this.getArticlesService
      .getArticles(1, GetTicketComponent.PICKER_SIZE, {
        name: this.pickerSearch() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.articles.set(response.data);
          this.pickerLoading.set(false);
        },
        error: () => this.pickerLoading.set(false),
      });
  }

  private settlePendingQuantities(items: TicketItem[]): void {
    const pending: Record<string, number> = {};

    for (const item of items) {
      const typed = this.pendingQuantities()[item.id];

      if (undefined === typed || typed === item.quantity) continue;

      pending[item.id] = typed;
    }

    this.pendingQuantities.set(pending);
  }

  private refresh(done?: () => void): void {
    this.getTicketService.getTicket(this.id()).subscribe({
      next: (response) => {
        this.attributes.set(response.data.attributes);
        this.settlePendingQuantities(response.data.attributes.items);
        done?.();
      },
      error: () => done?.(),
    });
  }

  private imageUrl(article: Article): string | null {
    return this.entityVisual.urlOf(
      VisualSurface.Shopping,
      AggregateImageKind.Article,
      article.id,
      article.attributes.image ?? null,
    );
  }
}
