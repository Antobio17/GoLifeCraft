import { Component, computed, inject, input, output } from "@angular/core";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ActivityHeatmapComponent } from "@shared/design-system/activity-heatmap/infrastructure/components/activity-heatmap.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { CtaRowComponent } from "@shared/design-system/cta-row/infrastructure/components/cta-row.component";
import { ModuleCardComponent } from "@shared/design-system/module-card/infrastructure/components/module-card.component";
import { BigFigureComponent } from "@shared/design-system/big-figure/infrastructure/components/big-figure.component";
import { StatStripComponent } from "@shared/design-system/stat-strip/infrastructure/components/stat-strip.component";
import { StatStripItem } from "@shared/design-system/stat-strip/domain/models/stat-strip-item.model";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import {
  GymActivityView,
  GymActivityViewService,
} from "../../application/services/gym-activity-view.service";
import { GymStats } from "../../domain/models/gym-stats.model";

const ACTIVITY_WEEKS = 27;
const TONNE_THRESHOLD_KG = 10000;

@Component({
  selector: "app-gym-analytics",
  templateUrl: "./gym-analytics.component.html",
  styleUrls: ["./gym-analytics.component.css"],
  imports: [
    RevealDirective,
    ContextualTranslatePipe,
    ActivityHeatmapComponent,
    SkeletonLineComponent,
    StackComponent,
    ModuleCardComponent,
    CtaRowComponent,
    SectionHeaderComponent,
    BigFigureComponent,
    StatStripComponent,
  ],
})
export class GymAnalyticsComponent {
  readonly stats = input<GymStats | null>(null);
  readonly loading = input(false);

  readonly seeAll = output<void>();

  private activityView = inject(GymActivityViewService);
  private translationService = inject(TranslationService);
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

  readonly statItems = computed<StatStripItem[]>(() => [
    {
      value: String(this.stats()?.totalSessions ?? 0),
      label: this.t("dashboard.gym.sessions"),
    },
    {
      ...this.volumeFigure(),
      label: this.t("dashboard.gym.volume"),
    },
    {
      value: String(this.stats()?.totalExercises ?? 0),
      label: this.t("dashboard.gym.exercises"),
    },
  ]);

  readonly activity = computed<GymActivityView>(() =>
    this.activityView.build(this.stats()?.trainingDays ?? [], ACTIVITY_WEEKS),
  );

  private t(key: string): string {
    return this.translationService.translate(key, "dashboard/dashboard");
  }

  private volumeFigure(): { value: string; unit: string } {
    const kg = this.stats()?.totalVolumeKg ?? 0;
    if (kg < TONNE_THRESHOLD_KG)
      return { value: this.totalVolumeText(), unit: "kg" };

    return { value: this.formatter.format(kg / 1000), unit: "t" };
  }
}
