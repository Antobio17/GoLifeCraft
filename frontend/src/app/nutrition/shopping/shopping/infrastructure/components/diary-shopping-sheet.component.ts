import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Subject, forkJoin, switchMap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import { ShoppingItemComponent } from "@shared/design-system/shopping-item/infrastructure/components/shopping-item.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { DiaryShoppingNeed } from "@nutrition/diary/diary/domain/models/diary-shopping-need.model";
import { GetDiaryShoppingNeedsService } from "@nutrition/diary/diary/application/services/get-diary-shopping-needs.service";
import { AddShoppingListItemService } from "@nutrition/shopping/shopping/application/services/add-shopping-list-item.service";
import { DiaryShoppingViewService } from "@nutrition/shopping/shopping/application/services/diary-shopping-view.service";
import { DiaryShoppingLabels } from "@nutrition/shopping/shopping/domain/models/diary-shopping-labels.model";
import { DiaryShoppingRow } from "@nutrition/shopping/shopping/domain/models/diary-shopping-row.model";

const MODULE_PATH = "nutrition/shopping/shopping";
const DEFAULT_RANGE_DAYS = 6;

@Component({
  selector: "app-diary-shopping-sheet",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    ModalSheetComponent,
    StackComponent,
    TextComponent,
    FieldComponent,
    DateInputComponent,
    ShoppingItemComponent,
    ButtonComponent,
    SkeletonListComponent,
  ],
  template: `
    <ds-modal-sheet
      [open]="sheetOpen()"
      [compact]="true"
      [title]="'getShopping.diary.title' | t"
      [closeLabel]="'getShopping.sheet.close' | t"
      (closed)="close()"
    >
      <ds-stack [gap]="'12px'">
        <ds-text variant="meta">{{ "getShopping.diary.subtitle" | t }}</ds-text>

        <ds-stack direction="row" [gap]="'10px'">
          <ds-stack [grow]="true">
            <ds-field [label]="'getShopping.diary.from' | t">
              <ds-date-input
                [ngModel]="fromDate()"
                [ngModelOptions]="{ standalone: true }"
                (ngModelChange)="onFromDate($event)"
              />
            </ds-field>
          </ds-stack>
          <ds-stack [grow]="true">
            <ds-field [label]="'getShopping.diary.to' | t">
              <ds-date-input
                [min]="fromDate()"
                [ngModel]="toDate()"
                [ngModelOptions]="{ standalone: true }"
                (ngModelChange)="onToDate($event)"
              />
            </ds-field>
          </ds-stack>
        </ds-stack>

        @if (loading()) {
          <ds-skeleton-list
            [count]="3"
            [gap]="'8px'"
            radius="16px"
            padding="9px 11px"
            [check]="true"
            [tile]="44"
            [tileRadius]="12"
            titleWidth="62%"
            metaWidth="44%"
            trailing="stack"
            pillWidth="80px"
            pillHeight="29px"
          />
        } @else {
          <ds-text variant="meta">{{ summaryLabel() }}</ds-text>

          @if (rows().length === 0) {
            <ds-text variant="muted">{{
              "getShopping.diary.empty" | t
            }}</ds-text>
          } @else {
            <ds-stack [gap]="'8px'">
              @for (row of rows(); track row.articleId) {
                <ds-shopping-item
                  [emoji]="row.emoji"
                  [name]="row.name"
                  [brand]="row.brand"
                  [store]="row.store"
                  [priceLabel]="row.priceLabel"
                  [packLabel]="row.packLabel"
                  [quantity]="row.quantity"
                  [checked]="row.checked"
                  [canWrite]="true"
                  [swipeable]="false"
                  [dimChecked]="false"
                  [toggleAriaLabel]="'getShopping.toggle' | t"
                  [incrementLabel]="'getShopping.increment' | t"
                  [decrementLabel]="'getShopping.decrement' | t"
                  (toggled)="toggle(row.articleId)"
                  (increment)="increment(row)"
                  (decrement)="decrement(row)"
                />
              }
            </ds-stack>

            <ds-button
              variant="primary"
              icon="cart"
              [fullWidth]="true"
              [disabled]="checkedCount() === 0"
              [loading]="saving()"
              (clicked)="confirm()"
            >
              {{ confirmLabel() }}
            </ds-button>
          }
        }
      </ds-stack>
    </ds-modal-sheet>
  `,
})
export class DiaryShoppingSheetComponent {
  private translationService = inject(TranslationService);
  private getDiaryShoppingNeedsService = inject(GetDiaryShoppingNeedsService);
  private addShoppingListItemService = inject(AddShoppingListItemService);
  private view = inject(DiaryShoppingViewService);

  @Input() set open(value: boolean) {
    this.sheetOpen.set(value);

    if (!value) return;

    this.resetRange();
    this.reload();
  }

  @Output() closed = new EventEmitter<void>();
  @Output() added = new EventEmitter<void>();

  private needs = signal<DiaryShoppingNeed[]>([]);
  private unchecked = signal<string[]>([]);
  private quantities = signal<Record<string, number>>({});
  private rangeChanges = new Subject<void>();

  sheetOpen = signal(false);
  fromDate = signal(this.view.todayIso());
  toDate = signal(this.view.addDays(this.view.todayIso(), DEFAULT_RANGE_DAYS));
  loading = signal(false);
  saving = signal(false);
  dayCount = signal(0);
  entryCount = signal(0);

  labels = computed<DiaryShoppingLabels>(() => ({
    perPack: this.t("getShopping.pack.perPack"),
    need: this.t("getShopping.pack.need"),
    stock: this.t("getShopping.diary.stock"),
    missing: this.t("getShopping.diary.missing"),
    covered: this.t("getShopping.diary.covered"),
    leftover: this.t("getShopping.pack.leftover"),
    inList: this.t("getShopping.diary.inList"),
  }));

  rows = computed(() =>
    this.view.rows(
      this.needs(),
      this.unchecked(),
      this.quantities(),
      this.labels(),
    ),
  );

  checkedCount = computed(
    () => this.rows().filter((row) => row.checked).length,
  );

  summaryLabel = computed(() =>
    this.translationService.translate(
      "getShopping.diary.summary",
      MODULE_PATH,
      {
        days: this.dayCount(),
        entries: this.entryCount(),
      },
    ),
  );

  confirmLabel = computed(() => {
    const count = this.checkedCount();
    if (count === 0) return this.t("getShopping.diary.confirmEmpty");

    const items =
      count === 1
        ? this.t("getShopping.diary.items.one")
        : this.translationService.translate(
            "getShopping.diary.items.many",
            MODULE_PATH,
            { count },
          );

    return this.translationService.translate(
      "getShopping.diary.confirm",
      MODULE_PATH,
      { items },
    );
  });

  constructor() {
    this.rangeChanges
      .pipe(
        switchMap(() =>
          this.getDiaryShoppingNeedsService.getDiaryShoppingNeeds(
            this.fromDate(),
            this.toDate(),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (response) => {
          const attributes = response.data.attributes;
          this.needs.set(attributes.needs);
          this.quantities.set(this.view.defaultQuantities(attributes.needs));
          this.unchecked.set(this.view.coveredArticleIds(attributes.needs));
          this.dayCount.set(attributes.dayCount);
          this.entryCount.set(attributes.entryCount);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onFromDate(value: string): void {
    if (!value) return;

    this.fromDate.set(value);

    if (this.toDate() < value) this.toDate.set(value);

    this.reload();
  }

  onToDate(value: string): void {
    if (!value) return;

    this.toDate.set(value < this.fromDate() ? this.fromDate() : value);
    this.reload();
  }

  increment(row: DiaryShoppingRow): void {
    this.setQuantity(row.articleId, row.quantity + 1);
  }

  decrement(row: DiaryShoppingRow): void {
    if (row.quantity <= 1) return;

    this.setQuantity(row.articleId, row.quantity - 1);
  }

  toggle(articleId: string): void {
    this.unchecked.update((ids) =>
      ids.includes(articleId)
        ? ids.filter((id) => id !== articleId)
        : [...ids, articleId],
    );
  }

  close(): void {
    this.sheetOpen.set(false);
    this.closed.emit();
  }

  confirm(): void {
    const checked = this.rows().filter((row) => row.checked);
    if (checked.length === 0 || this.saving()) return;

    this.saving.set(true);

    forkJoin(
      checked.map((row) =>
        this.addShoppingListItemService.addShoppingListItem(
          row.articleId,
          row.quantity,
          row.baseQuantity,
        ),
      ),
    ).subscribe({
      next: () => {
        this.saving.set(false);
        this.added.emit();
        this.close();
      },
      error: () => this.saving.set(false),
    });
  }

  private setQuantity(articleId: string, quantity: number): void {
    this.quantities.update((quantities) => ({
      ...quantities,
      [articleId]: quantity,
    }));
  }

  private resetRange(): void {
    const today = this.view.todayIso();

    this.fromDate.set(today);
    this.toDate.set(this.view.addDays(today, DEFAULT_RANGE_DAYS));
    this.unchecked.set([]);
    this.quantities.set({});
    this.needs.set([]);
  }

  private reload(): void {
    this.loading.set(true);
    this.rangeChanges.next();
  }

  private t(key: string): string {
    return this.translationService.translate(key, MODULE_PATH);
  }
}
