import { Component, EventEmitter, Input, Output } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { MUSCLE_GROUPS_BY_REGION } from "@gym/library/exercise/domain/constants/muscle-groups.constants";
import { GymStats, SessionVolume } from "../../domain/models/gym-stats.model";

interface RegionShare {
  region: string;
  sets: number;
  percent: number;
  index: number;
}

interface ProgressionChart {
  linePoints: string;
  areaPath: string;
  lastX: number;
  lastY: number;
  deltaLabel: string;
  positive: boolean;
}

const REGION_ORDER = ["Tren superior", "Core", "Tren inferior"];

const CHART_WIDTH = 300;
const CHART_HEIGHT = 100;
const CHART_PAD_TOP = 14;
const CHART_PAD_BOTTOM = 14;

@Component({
  selector: "app-gym-analytics",
  standalone: true,
  templateUrl: "./gym-analytics.component.html",
  styleUrls: ["./gym-analytics.component.css"],
  imports: [DecimalPipe, ContextualTranslatePipe],
})
export class GymAnalyticsComponent {
  @Input() stats: GymStats | null = null;
  @Input() loading = false;

  @Output() seeAll = new EventEmitter<void>();

  private readonly regionByMuscle = this.buildRegionLookup();

  get hasData(): boolean {
    const stats = this.stats;
    return !!stats && (stats.totalSessions > 0 || stats.totalSets > 0);
  }

  get sessionVolumes(): SessionVolume[] {
    return this.stats?.sessionVolumes ?? [];
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

    return REGION_ORDER.map((region, index) => {
      const sets = totals.get(region) ?? 0;
      return {
        region,
        sets,
        percent: total === 0 ? 0 : Math.round((sets / total) * 100),
        index,
      };
    });
  }

  get progression(): ProgressionChart | null {
    const points = this.stats?.volumeProgression ?? [];
    if (points.length < 2) {
      return null;
    }

    const values = points.map((p) => p.volumeKg);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const usableHeight = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;

    const xy = values.map((value, i) => ({
      x: +((i / (values.length - 1)) * CHART_WIDTH).toFixed(1),
      y: +(
        CHART_HEIGHT -
        CHART_PAD_BOTTOM -
        ((value - min) / span) * usableHeight
      ).toFixed(1),
    }));

    const last = xy[xy.length - 1];
    const first = values[0] || 1;
    const delta = ((values[values.length - 1] - values[0]) / first) * 100;

    return {
      linePoints: xy.map((p) => `${p.x},${p.y}`).join(" "),
      areaPath: `M${xy[0].x},${CHART_HEIGHT} L${xy
        .map((p) => `${p.x},${p.y}`)
        .join(" L")} L${last.x},${CHART_HEIGHT} Z`,
      lastX: last.x,
      lastY: last.y,
      deltaLabel: `${delta >= 0 ? "+" : ""}${delta.toFixed(0)}%`,
      positive: delta >= 0,
    };
  }

  barHeight(volumeKg: number): string {
    const max = Math.max(...this.sessionVolumes.map((s) => s.volumeKg), 1);
    return `${Math.max(6, Math.round((volumeKg / max) * 100))}%`;
  }

  isTopSession(volumeKg: number): boolean {
    const max = Math.max(...this.sessionVolumes.map((s) => s.volumeKg), 0);
    return volumeKg > 0 && volumeKg === max;
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
