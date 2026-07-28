import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
} from "@angular/core";
import { forkJoin } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { CheckRowComponent } from "@shared/design-system/check-row/infrastructure/components/check-row.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { AddShoppingListItemService } from "@nutrition/shopping/shopping/application/services/add-shopping-list-item.service";
import { GetMenuShoppingNeedsService } from "@nutrition/menu/menu/application/services/get-menu-shopping-needs.service";
import { MenuViewService } from "@nutrition/menu/menu/application/services/menu-view.service";
import { MenuShoppingNeed } from "@nutrition/menu/menu/domain/models/menu-shopping-needs.model";

interface ShoppingNeedRow {
  articleId: string;
  name: string;
  emoji: string;
  meta: string;
  checked: boolean;
}

const MODULE_PATH = "nutrition/menu/menu";

@Component({
  selector: "app-menu-shopping-sheet",
  standalone: true,
  imports: [
    ContextualTranslatePipe,
    ModalSheetComponent,
    StackComponent,
    TextComponent,
    CheckRowComponent,
    ButtonComponent,
  ],
  template: `
    <ds-modal-sheet
      [open]="open()"
      [compact]="true"
      [title]="'getMenu.shopping.title' | t"
      [closeLabel]="'getMenu.close' | t"
      (closed)="close()"
    >
      <ds-stack [gap]="'12px'">
        <ds-text variant="meta">{{ "getMenu.shopping.subtitle" | t }}</ds-text>
        <ds-text variant="meta">{{ sourceLabel() }}</ds-text>

        @if (rows().length === 0) {
          <ds-text variant="muted">{{ "getMenu.shopping.empty" | t }}</ds-text>
        } @else {
          <ds-stack [gap]="'7px'">
            @for (row of rows(); track row.articleId) {
              <ds-check-row
                [name]="row.name"
                [meta]="row.meta"
                [emoji]="row.emoji"
                [checked]="row.checked"
                (toggled)="toggle(row.articleId)"
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
      </ds-stack>
    </ds-modal-sheet>
  `,
})
export class MenuShoppingSheetComponent {
  private translationService = inject(TranslationService);
  private getMenuShoppingNeedsService = inject(GetMenuShoppingNeedsService);
  private addShoppingListItemService = inject(AddShoppingListItemService);
  private view = inject(MenuViewService);

  @Input() set menuId(value: string | null) {
    this.currentMenuId.set(value);

    if (!value) return;

    this.translationService
      .loadModuleTranslations(MODULE_PATH)
      .then(() => this.loadNeeds(value));
  }

  @Output() closed = new EventEmitter<void>();
  @Output() added = new EventEmitter<void>();

  private currentMenuId = signal<string | null>(null);
  private needs = signal<MenuShoppingNeed[]>([]);
  private unchecked = signal<string[]>([]);

  menuName = signal("");
  saving = signal(false);

  open = computed(() => this.currentMenuId() !== null);

  rows = computed<ShoppingNeedRow[]>(() =>
    this.needs().map((need) => ({
      articleId: need.articleId,
      name: need.name,
      emoji: need.emoji,
      meta: this.metaLabel(need),
      checked: !this.unchecked().includes(need.articleId),
    })),
  );

  checkedCount = computed(
    () => this.rows().filter((row) => row.checked).length,
  );

  sourceLabel = computed(() =>
    this.translationService.translate("getMenu.shopping.source", MODULE_PATH, {
      menu: this.menuName(),
    }),
  );

  confirmLabel = computed(() => {
    const count = this.checkedCount();
    if (count === 0) return this.t("getMenu.shopping.confirmEmpty");

    const items =
      count === 1
        ? this.t("getMenu.shopping.items.one")
        : this.translationService.translate(
            "getMenu.shopping.items.many",
            MODULE_PATH,
            { count },
          );

    return this.translationService.translate(
      "getMenu.shopping.confirm",
      MODULE_PATH,
      { items },
    );
  });

  toggle(articleId: string): void {
    this.unchecked.update((ids) =>
      ids.includes(articleId)
        ? ids.filter((id) => id !== articleId)
        : [...ids, articleId],
    );
  }

  close(): void {
    this.currentMenuId.set(null);
    this.closed.emit();
  }

  confirm(): void {
    const checked = this.rows().filter((row) => row.checked);
    if (checked.length === 0 || this.saving()) return;

    this.saving.set(true);

    forkJoin(
      checked.map((row) =>
        this.addShoppingListItemService.addShoppingListItem(row.articleId),
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

  private metaLabel(need: MenuShoppingNeed): string {
    const quantity = `≈ ${this.view.integer(need.quantity)} ${need.baseUnit}`;
    const store = need.store ?? need.brand;
    const base = store ? `${store} · ${quantity}` : quantity;

    if (!need.inShoppingList) return base;

    return `${base} · ${this.t("getMenu.shopping.inList")}`;
  }

  private loadNeeds(menuId: string): void {
    this.unchecked.set([]);

    this.getMenuShoppingNeedsService.getMenuShoppingNeeds(menuId).subscribe({
      next: (response) => {
        this.menuName.set(response.data.attributes.menuName);
        this.needs.set(response.data.attributes.needs);
      },
    });
  }

  private t(key: string): string {
    return this.translationService.translate(key, MODULE_PATH);
  }
}
