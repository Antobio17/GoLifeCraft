import { Component, computed, inject, signal } from "@angular/core";
import { Observable } from "rxjs";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonFiltersComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-filters.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { ChoiceRowComponent } from "@shared/design-system/choice-row/infrastructure/components/choice-row.component";
import { MenuCardComponent } from "@shared/design-system/menu-card/infrastructure/components/menu-card.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { GetMenusService } from "@nutrition/menu/menu/application/services/get-menus.service";
import { DeleteMenuService } from "@nutrition/menu/menu/application/services/delete-menu.service";
import { MenuViewService } from "@nutrition/menu/menu/application/services/menu-view.service";
import {
  MenuListItem,
  MenuType,
} from "@nutrition/menu/menu/domain/models/menu.model";
import { MenuLoadSheetComponent } from "./menu-load-sheet.component";
import { MenuApplyWeekSheetComponent } from "./menu-apply-week-sheet.component";
import { MenuShoppingSheetComponent } from "./menu-shopping-sheet.component";

interface MenuCardView {
  id: string;
  emoji: string;
  name: string;
  meta: string;
  kcal: string;
  kcalCaption: string;
  protein: string;
  fat: string;
  carbs: string;
  loadLabel: string;
  isWeek: boolean;
}

interface MenuGroupView {
  key: MenuType;
  label: string;
  countLabel: string;
  cards: MenuCardView[];
}

const SINGLE_EMOJI = "🍽️";
const WEEK_EMOJI = "🗓️";

@Component({
  selector: "app-get-menus",
  templateUrl: "./get-menus.component.html",
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    ButtonComponent,
    SearchInputComponent,
    SectionHeaderComponent,
    GridComponent,
    NoteComponent,
    StackComponent,
    TextComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    SkeletonFiltersComponent,
    ModalSheetComponent,
    ChoiceRowComponent,
    MenuCardComponent,
    ConfirmActionModalComponent,
    MenuLoadSheetComponent,
    MenuApplyWeekSheetComponent,
    MenuShoppingSheetComponent,
  ],
})
export class GetMenusComponent extends AbstractListPageComponent<MenuListItem> {
  private getMenusService = inject(GetMenusService);
  private deleteMenuService = inject(DeleteMenuService);
  private authSession = inject(AuthSessionService);
  protected view = inject(MenuViewService);

  protected readonly modulePath = "nutrition/menu/menu";
  protected readonly storageKey = "pageSize_menus";

  canWrite = this.authSession.isGod();

  searchQuery = signal("");
  typeSheetOpen = signal(false);

  loadSheetMenuId = signal<string | null>(null);
  applyWeekMenuId = signal<string | null>(null);
  shoppingMenuId = signal<string | null>(null);
  menuToDelete = signal<MenuListItem | null>(null);
  deleting = signal(false);

  headerSubtitle = computed(() => {
    const total = this.items().length;
    const count =
      total === 1
        ? this.t("getMenus.count.one")
        : this.translationService.translate(
            "getMenus.count.many",
            this.modulePath,
            { count: total },
          );

    return `${count} · ${this.t("getMenus.subtitle")}`;
  });

  filteredMenus = computed<MenuListItem[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.items().filter(
      (menu) => !query || menu.attributes.name.toLowerCase().includes(query),
    );
  });

  groups = computed<MenuGroupView[]>(() => {
    const menus = this.filteredMenus();
    const groups: MenuGroupView[] = [];

    const weekCards = menus
      .filter((menu) => menu.attributes.type === "week")
      .map((menu) => this.toCard(menu));
    const singleCards = menus
      .filter((menu) => menu.attributes.type === "single")
      .map((menu) => this.toCard(menu));

    if (weekCards.length > 0) {
      groups.push({
        key: "week",
        label: this.t("getMenus.groups.week"),
        countLabel: this.plural("getMenus.groups.weekCount", weekCards.length),
        cards: weekCards,
      });
    }

    if (singleCards.length > 0) {
      groups.push({
        key: "single",
        label: this.t("getMenus.groups.single"),
        countLabel: this.plural(
          "getMenus.groups.singleCount",
          singleCards.length,
        ),
        cards: singleCards,
      });
    }

    return groups;
  });

  hasResults = computed(() => this.filteredMenus().length > 0);
  isEmpty = computed(() => this.items().length === 0);

  deleteMessage = computed(() => this.menuToDelete()?.attributes.name ?? "");

  protected configureList(): void {
    this.pageSize.set(100);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<MenuListItem>> {
    return this.getMenusService.getMenus(page, pageSize);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  openTypeSheet(): void {
    this.typeSheetOpen.set(true);
  }

  closeTypeSheet(): void {
    this.typeSheetOpen.set(false);
  }

  onCreate(type: MenuType): void {
    this.typeSheetOpen.set(false);
    this.router.navigate(["/menus", "new"], { queryParams: { type } });
  }

  onOpen(card: MenuCardView): void {
    this.router.navigate(["/menus", card.id], {
      queryParams: { type: card.isWeek ? "week" : "single" },
    });
  }

  onLoad(card: MenuCardView): void {
    if (card.isWeek) {
      this.applyWeekMenuId.set(card.id);

      return;
    }

    this.loadSheetMenuId.set(card.id);
  }

  onShop(menuId: string): void {
    this.shoppingMenuId.set(menuId);
  }

  closeLoadSheet(): void {
    this.loadSheetMenuId.set(null);
  }

  closeApplyWeekSheet(): void {
    this.applyWeekMenuId.set(null);
  }

  closeShoppingSheet(): void {
    this.shoppingMenuId.set(null);
  }

  askDelete(menuId: string): void {
    const menu = this.items().find((item) => item.id === menuId) ?? null;
    this.menuToDelete.set(menu);
  }

  cancelDelete(): void {
    this.menuToDelete.set(null);
  }

  confirmDelete(): void {
    const menu = this.menuToDelete();
    if (!menu || this.deleting()) return;

    this.deleting.set(true);

    this.deleteMenuService.deleteMenu(menu.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.menuToDelete.set(null);
        this.load();
      },
      error: () => this.deleting.set(false),
    });
  }

  private toCard(menu: MenuListItem): MenuCardView {
    const attributes = menu.attributes;
    const isWeek = attributes.type === "week";

    return {
      id: menu.id,
      isWeek,
      emoji: attributes.emoji || (isWeek ? WEEK_EMOJI : SINGLE_EMOJI),
      name: attributes.name,
      meta: isWeek
        ? this.plural("getMenus.card.days", attributes.dayCount)
        : this.itemsLabel(attributes.itemCount),
      kcal: this.view.integer(attributes.perDay.calories),
      kcalCaption: this.t(
        isWeek ? "getMenus.card.kcalPerDay" : "getMenus.card.kcal",
      ),
      protein: this.view.grams(attributes.perDay.protein),
      fat: this.view.grams(attributes.perDay.fat),
      carbs: this.view.grams(attributes.perDay.carbs),
      loadLabel: this.t(isWeek ? "getMenus.card.apply" : "getMenus.card.load"),
    };
  }

  private itemsLabel(count: number): string {
    if (count === 0) return this.t("getMenus.card.items.zero");

    return this.plural("getMenus.card.items", count);
  }

  private plural(key: string, count: number): string {
    if (count === 1) return this.t(`${key}.one`);

    return this.translationService.translate(`${key}.many`, this.modulePath, {
      count,
    });
  }
}
