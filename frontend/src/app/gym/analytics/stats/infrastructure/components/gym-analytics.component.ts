import { Component, computed, inject, input, output } from "@angular/core";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { MuscleCatalogService } from "@gym/library/exercise/application/services/muscle-catalog.service";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ActivityHeatmapComponent } from "@shared/design-system/activity-heatmap/infrastructure/components/activity-heatmap.component";
import { SkeletonMetricsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-metrics.component";
import { SkeletonPanelComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-panel.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { StatTileComponent } from "@shared/design-system/stat-tile/infrastructure/components/stat-tile.component";
import { PanelComponent } from "@shared/design-system/panel/infrastructure/components/panel.component";
import { MeterComponent } from "@shared/design-system/meter/infrastructure/components/meter.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import {
  GymActivityView,
  GymActivityViewService,
} from "../../application/services/gym-activity-view.service";
import { GymStats } from "../../domain/models/gym-stats.model";

interface RegionShare {
  region: string;
  percent: number;
  color: string;
}

const ACTIVITY_WEEKS = 27;

const REGION_COLORS = [
  "var(--gym-muscle-1)",
  "var(--gym-muscle-2)",
  "var(--gym-muscle-3)",
];

@Component({
  selector: "app-gym-analytics",
  templateUrl: "./gym-analytics.component.html",
  styleUrls: ["./gym-analytics.component.css"],
  imports: [
    RevealDirective,
    ContextualTranslatePipe,
    TextComponent,
    ActivityHeatmapComponent,
    SkeletonMetricsComponent,
    SkeletonPanelComponent,
    StackComponent,
    SectionHeaderComponent,
    StatTileComponent,
    PanelComponent,
    MeterComponent,
  ],
})
export class GymAnalyticsComponent {
  readonly stats = input<GymStats | null>(null);
  readonly loading = input(false);

  readonly seeAll = output<void>();

  private muscleCatalog = inject(MuscleCatalogService);
  private activityView = inject(GymActivityViewService);
  private readonly formatter = new Intl.NumberFormat("es", {
    maximumFractionDigits: 0,
  });

  readonly hasData = computed<boolean>(() => {
    const stats = this.stats();

    return !!stats && (stats.totalSessions > 0 || stats.totalSets > 0);
  });

  readonly totalVolumeText = computed<string>(() =>
    this.formatter
      .formatToParts(this.stats()?.totalVolumeKg ?? 0)
      .map((part) => (part.type === "group" ? "\u202f" : part.value))
      .join(""),
  );

  readonly activity = computed<GymActivityView>(() =>
    this.activityView.build(this.stats()?.trainingDays ?? [], ACTIVITY_WEEKS),
  );

  readonly regionShares = computed<RegionShare[]>(() => {
    const distribution = this.stats()?.muscleDistribution ?? [];
    const order = this.muscleCatalog.regionNames();
    const totals = new Map<string, number>(order.map((region) => [region, 0]));

    for (const item of distribution) {
      const region = this.muscleCatalog.regionOf(item.muscleGroup);
      if (!region) continue;
      totals.set(region, (totals.get(region) ?? 0) + item.sets);
    }

    const total = [...totals.values()].reduce((acc, value) => acc + value, 0);

    return order.map((region, index) => ({
      region,
      percent:
        total === 0 ? 0 : Math.round(((totals.get(region) ?? 0) / total) * 100),
      color: REGION_COLORS[index] ?? REGION_COLORS[0],
    }));
  });
}
