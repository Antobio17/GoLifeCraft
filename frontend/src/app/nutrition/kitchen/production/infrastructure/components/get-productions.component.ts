import { Component, computed, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { GetProductionsService } from "@nutrition/kitchen/production/application/services/get-productions.service";
import { ProductionRangeService } from "@nutrition/kitchen/production/application/services/production-range.service";
import { ProductionViewService } from "@nutrition/kitchen/production/application/services/production-view.service";
import { ProductionListItem } from "@nutrition/kitchen/production/domain/models/production-list-item.model";
import { ProductionListRow } from "@nutrition/kitchen/production/domain/models/production-list-row.model";
import { ProductionStatus } from "@nutrition/kitchen/production/domain/models/production-status.model";

const FALLBACK_EMOJI = "🍲";

@Component({
  selector: "app-get-productions",
  templateUrl: "./get-productions.component.html",
  imports: [
    ContextualTranslatePipe,
    RevealDirective,
    PageWrapperComponent,
    StackComponent,
    ScreenHeaderComponent,
    TextComponent,
    ButtonComponent,
    CardComponent,
    ChipComponent,
    EmojiTileComponent,
    EmptyStateComponent,
    SkeletonListComponent,
  ],
})
export class GetProductionsComponent extends AbstractListPageComponent<ProductionListItem> {
  private getProductionsService = inject(GetProductionsService);
  protected range = inject(ProductionRangeService);
  protected view = inject(ProductionViewService);

  protected readonly modulePath = "nutrition/kitchen/production";
  protected readonly storageKey = "pageSize_productions";

  rows = computed<ProductionListRow[]>(() =>
    this.items().map((production) => {
      const attributes = production.attributes;
      const cooking = ProductionStatus.Cooking === attributes.status;

      return {
        production,
        title: this.range.rangeLabel(attributes.fromDate, attributes.toDate),
        meta: this.translate("getProductions.meta", {
          recipes: attributes.itemCount,
          servings: this.view.servings(
            cooking ? attributes.servingsPlanned : attributes.servingsCooked,
          ),
        }),
        statusLabel: cooking
          ? this.translate("getProductions.status.cooking", {
              cooked: attributes.cookedCount,
              total: attributes.itemCount,
            })
          : this.t("getProductions.status.done"),
        cooking,
        emoji: attributes.emojis[0] ?? FALLBACK_EMOJI,
      };
    }),
  );

  protected configureList(): void {
    this.pageSize.set(100);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<ProductionListItem>> {
    return this.getProductionsService.getProductions(page, pageSize);
  }

  onCreate(): void {
    this.router.navigate(["/cocina/nueva"]);
  }

  onOpen(production: ProductionListItem): void {
    this.router.navigate(["/cocina", production.id]);
  }

  private translate(key: string, params: Record<string, unknown>): string {
    return this.translationService.translate(key, this.modulePath, params);
  }
}
