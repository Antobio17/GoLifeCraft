import { Component, inject, input, output } from "@angular/core";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { MuscleCatalogService } from "@gym/library/exercise/application/services/muscle-catalog.service";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import {
  BarChartComponent,
  BarDatum,
} from "@shared/design-system/bar-chart/infrastructure/components/bar-chart.component";
import { LineChartComponent } from "@shared/design-system/line-chart/infrastructure/components/line-chart.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { StatTileComponent } from "@shared/design-system/stat-tile/infrastructure/components/stat-tile.component";
import { PanelComponent } from "@shared/design-system/panel/infrastructure/components/panel.component";
import { TrendBadgeComponent } from "@shared/design-system/trend-badge/infrastructure/components/trend-badge.component";
import { MeterComponent } from "@shared/design-system/meter/infrastructure/components/meter.component";
import { GymStats } from "../../domain/models/gym-stats.model";

interface RegionShare {
  region: string;
  percent: number;
  index: number;
}

interface ProgressionDelta {
  label: string;
  positive: boolean;
}

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
    ContextualTranslatePipe,
    TextComponent,
    BarChartComponent,
    LineChartComponent,
    SkeletonComponent,
    StackComponent,
    GridComponent,
    SectionHeaderComponent,
    StatTileComponent,
    PanelComponent,
    TrendBadgeComponent,
    MeterComponent,
  ],
})
export class GymAnalyticsComponent {
  readonly stats = input<GymStats | null>(null);
  readonly loading = input(false);

  readonly seeAll = output<void>();

  private muscleCatalog = inject(MuscleCatalogService);
  private readonly formatter = new Intl.NumberFormat("es", {
    maximumFractionDigits: 0,
  });

  get hasData(): boolean {
    const stats = this.stats();
    return !!stats && (stats.totalSessions > 0 || stats.totalSets > 0);
  }

  get totalVolumeText(): string {
    return this.formatter
      .formatToParts(this.stats()?.totalVolumeKg ?? 0)
      .map((part) => (part.type === "group" ? "\u202f" : part.value))
      .join("");
  }

  get volumeBars(): BarDatum[] {
    return (this.stats()?.sessionVolumes ?? []).map((session) => ({
      id: session.id,
      label: session.name,
      value: session.volumeKg,
      display: this.formatter.format(session.volumeKg),
    }));
  }

  get progressionPoints(): number[] {
    return (this.stats()?.volumeProgression ?? []).map(
      (point) => point.volumeKg,
    );
  }

  get hasProgression(): boolean {
    return this.progressionPoints.length >= 2;
  }

  get progressionDelta(): ProgressionDelta | null {
    const values = this.progressionPoints;
    if (values.length < 2) {
      return null;
    }

    const first = values[0] || 1;
    const delta = ((values[values.length - 1] - values[0]) / first) * 100;
    return {
      label: `${delta >= 0 ? "+" : ""}${delta.toFixed(0)}%`,
      positive: delta >= 0,
    };
  }

  get regionShares(): RegionShare[] {
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
      index,
    }));
  }

  regionColor(index: number): string {
    return REGION_COLORS[index] ?? REGION_COLORS[0];
  }
}
