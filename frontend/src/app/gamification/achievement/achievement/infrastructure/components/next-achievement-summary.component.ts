import { Component, computed, inject, output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { ModuleCardComponent } from "@shared/design-system/module-card/infrastructure/components/module-card.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { AchievementMedalComponent } from "@shared/design-system/achievement-medal/infrastructure/components/achievement-medal.component";
import { GetAchievementsService } from "../../application/services/get-achievements.service";
import { AchievementViewService } from "../../application/services/achievement-view.service";
import { Achievement } from "../../domain/models/achievement.model";

@Component({
  selector: "app-next-achievement-summary",
  templateUrl: "./next-achievement-summary.component.html",
  imports: [
    ContextualTranslatePipe,
    StackComponent,
    TextComponent,
    SectionHeaderComponent,
    ModuleCardComponent,
    SkeletonLineComponent,
    AchievementMedalComponent,
  ],
})
export class NextAchievementSummaryComponent {
  private getAchievementsService = inject(GetAchievementsService);
  private view = inject(AchievementViewService);
  private translationService = inject(TranslationService);

  private readonly MODULE_PATH = "gamification/achievement/achievement";

  readonly seeAll = output<void>();

  readonly achievements = signal<Achievement[] | null>(null);
  readonly loading = computed(() => null === this.achievements());
  readonly next = computed(() => this.view.next(this.achievements() ?? []));

  readonly nextName = computed(() => {
    const next = this.next();

    if (!next?.nextTier) return "";

    return this.t("achievements.next.name", {
      name: this.view.name(next, this.translate),
      tier: this.view.tierLabel(next.nextTier, this.translate),
    });
  });

  readonly remainingLabel = computed(() => {
    const next = this.next();

    if (!next) return "";

    return this.view.remaining(next, this.translate);
  });

  private readonly translate = (
    key: string,
    params?: Record<string, unknown>,
  ): string => this.t(key, params);

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);

    this.getAchievementsService
      .getAchievements()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (achievements) => this.achievements.set(achievements),
        error: () => this.achievements.set([]),
      });
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }
}
