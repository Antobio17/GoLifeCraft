import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  output,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { SkeletonPanelComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-panel.component";
import { BalanceCardComponent } from "@shared/design-system/balance-card/infrastructure/components/balance-card.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { GetFinanceOverviewService } from "@economy/finance/transaction/application/services/get-finance-overview.service";
import { FinanceViewService } from "@economy/finance/transaction/application/services/finance-view.service";
import { FinanceOverviewAttributes } from "@economy/finance/transaction/domain/models/finance-overview-attributes.model";

@Component({
  selector: "app-finance-balance-summary",
  templateUrl: "./finance-balance-summary.component.html",
  imports: [
    RevealDirective,
    ContextualTranslatePipe,
    StackComponent,
    TextComponent,
    SectionHeaderComponent,
    SkeletonPanelComponent,
    BalanceCardComponent,
  ],
})
export class FinanceBalanceSummaryComponent implements OnInit {
  private getFinanceOverviewService = inject(GetFinanceOverviewService);
  private view = inject(FinanceViewService);
  private destroyRef = inject(DestroyRef);

  readonly seeAll = output<void>();

  loading = signal(true);
  overview = signal<FinanceOverviewAttributes | null>(null);

  hasBalance = computed(() => this.overview() !== null);

  balanceValue = computed(() =>
    this.view.moneyPlain(this.overview()?.balance ?? 0),
  );
  balanceTrendLabel = computed(() =>
    this.view.percentage(this.overview()?.balanceDeltaPercentage ?? 0),
  );
  balancePositive = computed(() => (this.overview()?.balanceDelta ?? 0) >= 0);
  balanceDeltaLabel = computed(() =>
    this.view.signedMoney(this.overview()?.balanceDelta ?? 0),
  );
  balanceSeries = computed(() =>
    (this.overview()?.series ?? []).map((point) => point.endBalance),
  );
  balanceSeriesLabels = computed(() =>
    (this.overview()?.series ?? []).map((point) =>
      this.view.moneyShort(point.endBalance),
    ),
  );
  balanceSeriesCaptions = computed(() =>
    (this.overview()?.series ?? []).map((point) =>
      this.view.monthShort(point.month),
    ),
  );

  ngOnInit(): void {
    this.getFinanceOverviewService
      .getFinanceOverview(this.view.currentMonth())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.overview.set(response.data.attributes);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
