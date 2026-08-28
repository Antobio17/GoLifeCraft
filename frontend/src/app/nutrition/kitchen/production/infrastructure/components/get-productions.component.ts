import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { catchError } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { GetProductionsService } from "@nutrition/kitchen/production/application/services/get-productions.service";
import { ProductionRangeService } from "@nutrition/kitchen/production/application/services/production-range.service";
import { ProductionListItem } from "@nutrition/kitchen/production/domain/models/production-list-item.model";
import { ProductionListRow } from "@nutrition/kitchen/production/domain/models/production-list-row.model";
import { ProductionStatus } from "@nutrition/kitchen/production/domain/models/production-status.model";

@Component({
  selector: "app-get-productions",
  templateUrl: "./get-productions.component.html",
  imports: [
    ContextualTranslatePipe,
    RevealDirective,
    PageWrapperComponent,
    StackComponent,
    HeadingComponent,
    TextComponent,
    ButtonComponent,
    CardComponent,
    ChipComponent,
    EmojiTileComponent,
    EmptyStateComponent,
    SkeletonListComponent,
  ],
})
export class GetProductionsComponent {
  private translationService = inject(TranslationService);
  private getProductionsService = inject(GetProductionsService);
  private router = inject(Router);
  protected range = inject(ProductionRangeService);

  private readonly MODULE_PATH = "nutrition/kitchen/production";

  loading = signal(true);
  productions = signal<ProductionListItem[]>([]);

  rows = computed<ProductionListRow[]>(() =>
    this.productions().map((production) => {
      const attributes = production.attributes;
      const cooking = ProductionStatus.Cooking === attributes.status;

      return {
        production,
        title: this.range.rangeLabel(attributes.fromDate, attributes.toDate),
        meta: this.t("getProductions.meta", {
          recipes: attributes.itemCount,
          servings: this.range.servings(
            cooking ? attributes.servingsPlanned : attributes.servingsCooked,
          ),
        }),
        statusLabel: cooking
          ? this.t("getProductions.status.cooking", {
              cooked: attributes.cookedCount,
              total: attributes.itemCount,
            })
          : this.t("getProductions.status.done"),
        cooking,
        emoji: attributes.emojis[0] ?? "🍲",
      };
    }),
  );

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);
    this.load();
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }

  onCreate(): void {
    this.router.navigate(["/cocina/nueva"]);
  }

  onOpen(production: ProductionListItem): void {
    this.router.navigate(["/cocina", production.id]);
  }

  private load(): void {
    this.loading.set(true);

    this.getProductionsService
      .getProductions()
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        this.productions.set(response?.data ?? []);
        this.loading.set(false);
      });
  }
}
