import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import {
  ChoiceChipOption,
  ChoiceChipsComponent,
} from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { AchievementMedalComponent } from "@shared/design-system/achievement-medal/infrastructure/components/achievement-medal.component";
import { GetAchievementsService } from "../../application/services/get-achievements.service";
import { AchievementViewService } from "../../application/services/achievement-view.service";
import { Achievement } from "../../domain/models/achievement.model";
import { AchievementFilter } from "../../domain/models/achievement-filter.enum";

const SKELETON_MEDALS = Array.from({ length: 6 }, (_, index) => index);

@Component({
  selector: "app-achievements",
  templateUrl: "./achievements.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    GridComponent,
    TextComponent,
    SectionHeaderComponent,
    SkeletonLineComponent,
    ChoiceChipsComponent,
    AchievementMedalComponent,
  ],
})
export class AchievementsComponent {
  private getAchievementsService = inject(GetAchievementsService);
  private view = inject(AchievementViewService);
  private translationService = inject(TranslationService);
  private backNavigation = inject(BackNavigationService);

  private readonly MODULE_PATH = "gamification/achievement/achievement";

  readonly skeletonMedals = SKELETON_MEDALS;
  readonly achievements = signal<Achievement[] | null>(null);
  readonly filter = signal<AchievementFilter>(AchievementFilter.All);

  readonly loading = computed(() => null === this.achievements());

  readonly tally = computed(() => this.view.tally(this.achievements() ?? []));

  readonly tallyLabel = computed(() =>
    this.t("achievements.tally", { ...this.tally() }),
  );

  readonly recent = computed(() =>
    this.view.recent(this.achievements() ?? [], new Date(), this.translate),
  );

  readonly sections = computed(() =>
    this.view.sections(
      this.achievements() ?? [],
      this.filter(),
      this.translate,
    ),
  );

  readonly filterOptions = computed<ChoiceChipOption[]>(() =>
    Object.values(AchievementFilter).map((filter) => ({
      value: filter,
      label: this.t(`achievements.filter.${filter}`),
    })),
  );

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

  changeFilter(filter: string): void {
    this.filter.set(filter as AchievementFilter);
  }

  back(): void {
    this.backNavigation.back(["/dashboard"]);
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }
}
