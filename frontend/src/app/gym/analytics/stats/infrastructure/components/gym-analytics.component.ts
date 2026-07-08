import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { MUSCLE_GROUPS_BY_REGION } from "@gym/library/exercise/domain/constants/muscle-groups.constants";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { StatComponent } from "@shared/design-system/stat/infrastructure/components/stat.component";
import {
  BarChartComponent,
  BarDatum,
} from "@shared/design-system/bar-chart/infrastructure/components/bar-chart.component";
import { LineChartComponent } from "@shared/design-system/line-chart/infrastructure/components/line-chart.component";
import { MeterComponent } from "@shared/design-system/meter/infrastructure/components/meter.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
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

const REGION_ORDER = ["Tren superior", "Core", "Tren inferior"];
const REGION_COLORS = [
  "var(--ds-primary)",
  "var(--ds-accent)",
  "var(--ds-lime-500)",
];

@Component({
  selector: "app-gym-analytics",
  templateUrl: "./gym-analytics.component.html",
  imports: [
    ContextualTranslatePipe,
    StackComponent,
    GridComponent,
    CardComponent,
    HeadingComponent,
    TextComponent,
    ChipComponent,
    ButtonComponent,
    StatComponent,
    BarChartComponent,
    LineChartComponent,
    MeterComponent,
    SkeletonComponent,
  ],
})
export class GymAnalyticsComponent {
  @Input() stats: GymStats | null = null;
  @Input() loading = false;

  @Output() seeAll = new EventEmitter<void>();

  private readonly regionByMuscle = this.buildRegionLookup();
  private readonly formatter = new Intl.NumberFormat("es", {
    maximumFractionDigits: 0,
  });

  get hasData(): boolean {
    const stats = this.stats;
    return !!stats && (stats.totalSessions > 0 || stats.totalSets > 0);
  }

  get totalVolumeText(): string {
    return this.formatter.format(this.stats?.totalVolumeKg ?? 0);
  }

  get volumeBars(): BarDatum[] {
    return (this.stats?.sessionVolumes ?? []).map((session) => ({
      id: session.id,
      label: session.name,
      value: session.volumeKg,
      display: this.formatter.format(session.volumeKg),
    }));
  }

  get progressionPoints(): number[] {
    return (this.stats?.volumeProgression ?? []).map((point) => point.volumeKg);
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
    const distribution = this.stats?.muscleDistribution ?? [];
    const totals = new Map<string, number>(REGION_ORDER.map((r) => [r, 0]));

    for (const item of distribution) {
      const region = this.regionByMuscle.get(item.muscleGroup);
      if (region) {
        totals.set(region, (totals.get(region) ?? 0) + item.sets);
      }
    }

    const total = [...totals.values()].reduce((acc, value) => acc + value, 0);

    return REGION_ORDER.map((region, index) => ({
      region,
      percent:
        total === 0 ? 0 : Math.round(((totals.get(region) ?? 0) / total) * 100),
      index,
    }));
  }

  regionColor(index: number): string {
    return REGION_COLORS[index] ?? REGION_COLORS[0];
  }

  private buildRegionLookup(): Map<string, string> {
    const lookup = new Map<string, string>();
    for (const group of MUSCLE_GROUPS_BY_REGION) {
      for (const muscle of group.items) {
        lookup.set(muscle, group.region);
      }
    }
    return lookup;
  }
}
